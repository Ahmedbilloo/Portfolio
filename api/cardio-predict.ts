import { validateCardioInput } from "../lib/cardio-model";

export default async function handler(req: any, res: any) {
  const input = (req.method === "GET"
    ? { age_years: 54, ap_hi: 142, ap_lo: 90, cholesterol: 2, active: 1, weight: 78, height: 170, smoke: 0 }
    : req.body) as Record<string, number | boolean>;

  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  const validationError = validateCardioInput(input || {});
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const [metaResponse, treeResponse] = await Promise.all([
      fetch("https://raw.githubusercontent.com/Ahmedbilloo/Portfolio/main/src/data/cardiovascular-rf-metadata.json"),
      fetch("https://raw.githubusercontent.com/Ahmedbilloo/Portfolio/main/src/data/cardiovascular-rf-trees.bin.gz")
    ]);
    if (!metaResponse.ok || !treeResponse.ok) {
      throw new Error(`Artifact fetch status: metadata=${metaResponse.status}, trees=${treeResponse.status}`);
    }
    const metadata = await metaResponse.json();
    if (metadata.format_version !== 2 || metadata.tree_record_bytes !== 13 || !Array.isArray(metadata.tree_node_counts)) {
      throw new Error("Model metadata has an unsupported format.");
    }
    const compressed = Buffer.from(await treeResponse.arrayBuffer());
    const { gunzipSync } = await import("node:zlib");
    const treeBuffer = gunzipSync(compressed);
    const expectedBytes = metadata.tree_node_counts.reduce((sum: number, count: number) => sum + count, 0) * metadata.tree_record_bytes;
    if (treeBuffer.byteLength !== expectedBytes) {
      throw new Error(`Model size mismatch: expected ${expectedBytes}, received ${treeBuffer.byteLength}`);
    }

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
    const recordBytes = metadata.tree_record_bytes as number;
    let treeStart = 0;
    let sum = 0;
    for (const nodeCount of metadata.tree_node_counts as number[]) {
      let localIndex = 0;
      let guard = 0;
      while (localIndex >= 0 && localIndex < nodeCount && guard <= nodeCount) {
        const offset = (treeStart + localIndex) * recordBytes;
        const left = treeBuffer.readUInt16LE(offset);
        const right = treeBuffer.readUInt16LE(offset + 2);
        const feature = treeBuffer.readInt8(offset + 4);
        if (feature < 0) {
          sum += treeBuffer.readFloatLE(offset + 9);
          break;
        }
        const threshold = treeBuffer.readFloatLE(offset + 5);
        localIndex = row[feature] <= threshold ? left : right;
        guard++;
      }
      if (guard > nodeCount) throw new Error("Tree traversal exceeded node count.");
      treeStart += nodeCount;
    }
    const probability = sum / metadata.tree_node_counts.length;
    res.status(200).json({
      ok: true,
      probability,
      probabilityPercent: Number((probability * 100).toFixed(1)),
      model: metadata.model,
      test: req.method === "GET"
    });
  } catch (error) {
    console.error("Cardio prediction failed:", error);
    res.status(503).json({
      error: "The model could not complete the prediction.",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
}
