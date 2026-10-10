export default async function handler(req: any, res: any) {
  const input = (req.method === "GET"
    ? { age_years: 54, ap_hi: 142, ap_lo: 90, cholesterol: 2, active: 1, weight: 78, height: 170, smoke: 0 }
    : req.body) as Record<string, number | boolean>;

  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const ranges: Record<string, [number, number]> = {
    age_years: [18, 100], ap_hi: [60, 250], ap_lo: [30, 180], cholesterol: [1, 3],
    active: [0, 1], weight: [25, 300], height: [100, 230], smoke: [0, 1]
  };
  for (const [key, range] of Object.entries(ranges)) {
    const value = Number(input?.[key]);
    if (!Number.isFinite(value) || value < range[0] || value > range[1] ||
      (["cholesterol", "active", "smoke"].includes(key) && !Number.isInteger(value))) {
      res.status(400).json({ error: `Invalid value for ${key}; expected ${range[0]} to ${range[1]}.` });
      return;
    }
  }
  if (Number(input.ap_hi) <= Number(input.ap_lo)) {
    res.status(400).json({ error: "Systolic blood pressure must be greater than diastolic blood pressure. Please correct the inputs." });
    return;
  }

  try {
    const [metaResponse, treeResponse] = await Promise.all([
      fetch("https://raw.githubusercontent.com/Ahmedbilloo/Portfolio/main/src/data/cardiovascular-rf-metadata.json"),
      fetch("https://raw.githubusercontent.com/Ahmedbilloo/Portfolio/main/src/data/cardiovascular-rf-trees.bin.gz")
    ]);
    if (!metaResponse.ok || !treeResponse.ok) throw new Error(`Artifact fetch status: metadata=${metaResponse.status}, trees=${treeResponse.status}`);
    const metadata = await metaResponse.json();
    if (metadata.format_version !== 3 || metadata.tree_record_bytes !== 13 || !Array.isArray(metadata.tree_node_counts) || !metadata.calibration) {
      throw new Error("Calibrated model artifacts are not published yet. Refusing to return an uncalibrated probability.");
    }
    const compressed = Buffer.from(await treeResponse.arrayBuffer());
    const { gunzipSync } = await import("node:zlib");
    const treeBuffer = gunzipSync(compressed);
    const expectedBytes = metadata.tree_node_counts.reduce((sum: number, count: number) => sum + count, 0) * metadata.tree_record_bytes;
    if (treeBuffer.byteLength !== expectedBytes) throw new Error("Compressed tree artifact size does not match metadata.");

    const raw: Record<string, number> = {
      age_years: Number(input.age_years), ap_hi: Number(input.ap_hi), ap_lo: Number(input.ap_lo),
      cholesterol: Number(input.cholesterol), active: Number(input.active), weight: Number(input.weight),
      height: Number(input.height), smoke: Number(input.smoke)
    };
    const encoded: Record<string, number> = { ...raw };
    for (const name of metadata.encoded_feature_columns as string[]) {
      if (name.startsWith("cholesterol_")) encoded[name] = raw.cholesterol === Number(name.split("_")[1]) ? 1 : 0;
      else if (name.startsWith("active_")) encoded[name] = raw.active === Number(name.split("_")[1]) ? 1 : 0;
      else if (name.startsWith("smoke_")) encoded[name] = raw.smoke === Number(name.split("_")[1]) ? 1 : 0;
    }
    const row = (metadata.encoded_feature_columns as string[]).map((name: string) => encoded[name] ?? 0);
    let treeStart = 0;
    let rawSum = 0;
    for (const nodeCount of metadata.tree_node_counts as number[]) {
      let localIndex = 0;
      let steps = 0;
      while (localIndex < nodeCount && steps <= nodeCount) {
        const offset = (treeStart + localIndex) * metadata.tree_record_bytes;
        const left = treeBuffer.readUInt16LE(offset);
        const right = treeBuffer.readUInt16LE(offset + 2);
        const feature = treeBuffer.readInt8(offset + 4);
        if (feature < 0) {
          rawSum += treeBuffer.readFloatLE(offset + 9);
          break;
        }
        localIndex = row[feature] <= treeBuffer.readFloatLE(offset + 5) ? left : right;
        steps++;
      }
      if (steps > nodeCount || localIndex >= nodeCount) throw new Error("Tree traversal did not reach a leaf.");
      treeStart += nodeCount;
    }
    const rawProbability = rawSum / metadata.tree_node_counts.length;
    const calibration = metadata.calibration;
    const rawClipped = Math.max(1e-6, Math.min(1 - 1e-6, rawProbability));
    const rawLogit = Math.log(rawClipped / (1 - rawClipped));
    const calibratedProbability = 1 / (1 + Math.exp(-(calibration.intercept + calibration.coefficient * rawLogit)));
    res.status(200).json({
      ok: true,
      probability: calibratedProbability,
      probabilityPercent: Number((calibratedProbability * 100).toFixed(1)),
      rawProbability,
      calibrated: true,
      calibration: calibration.method,
      model: metadata.model,
      test: req.method === "GET"
    });
  } catch (error) {
    console.error("Cardio prediction failed:", error);
    res.status(503).json({ error: "The calibrated model could not complete the prediction.", detail: error instanceof Error ? error.message : String(error) });
  }
}
