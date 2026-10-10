
export type CardioModel = {
  format_version: number;
  model: string;
  target: string;
  target_meaning: string;
  raw_features: string[];
  categorical_features: string[];
  encoded_feature_columns: string[];
  parameters: Record<string, unknown>;
  dataset_records: number;
  test_roc_auc: number;
  test_brier_score: number;
  feature_importances: Record<string, number>;
  tree_node_counts: number[];
  tree_record_bytes: number;
  treeBuffer: Buffer;
};

export type CardioModelMetadata = Omit<CardioModel, "treeBuffer">;

export function getCardioModelMetadata(): CardioModelMetadata | null {
  return null;
}

/**
 * The fitted forest is a large binary artifact. Fetch it from the public source
 * repository instead of bundling it into each Vercel function, which can exceed
 * serverless deployment package limits. Cache it in the warm function instance.
 */
let cachedModel: CardioModel | null = null;
let modelPromise: Promise<CardioModel | null> | null = null;

export async function getCardioModel(): Promise<CardioModel | null> {
  if (cachedModel) return cachedModel;
  if (modelPromise) return modelPromise;

  modelPromise = (async () => {
    try {
      const baseUrl = "https://raw.githubusercontent.com/Ahmedbilloo/Portfolio/main/src/data/";
      const [metadataResponse, treeResponse] = await Promise.all([
        fetch(baseUrl + "cardiovascular-rf-metadata.json", { cache: "no-store" }),
        fetch(baseUrl + "cardiovascular-rf-trees.bin.gz", { cache: "no-store" })
      ]);
      if (!metadataResponse.ok || !treeResponse.ok) throw new Error(`Model artifact fetch failed (metadata ${metadataResponse.status}, trees ${treeResponse.status}).`);
      const metadata = await metadataResponse.json() as CardioModelMetadata;
      if (metadata.format_version !== 2 || metadata.tree_record_bytes !== 13) throw new Error("Unsupported model artifact format.");
      const compressed = Buffer.from(await treeResponse.arrayBuffer());
      const { gunzipSync } = await import("node:zlib");
      const treeBuffer = gunzipSync(compressed);
      const expectedBytes = metadata.tree_node_counts.reduce((sum, count) => sum + count, 0) * metadata.tree_record_bytes;
      if (treeBuffer.byteLength !== expectedBytes) return null;

      cachedModel = { ...metadata, treeBuffer } as CardioModel;
      return cachedModel;
    } catch (error) {
      console.error("Cardio model load failed:", error);
      throw error;
    } finally {
      modelPromise = null;
    }
  })();

  return modelPromise;
}

export function predictCardioProbability(model: CardioModel, input: Record<string, number | boolean>): number {
  const raw: Record<string, number> = {
    age_years: Number(input.age_years),
    ap_hi: Number(input.ap_hi),
    ap_lo: Number(input.ap_lo),
    cholesterol: Number(input.cholesterol),
    active: Number(input.active),
    weight: Number(input.weight),
    height: Number(input.height),
    smoke: Number(input.smoke),
  };
  const encoded: Record<string, number> = { ...raw };
  for (const name of model.encoded_feature_columns) {
    if (name.startsWith("cholesterol_")) encoded[name] = raw.cholesterol === Number(name.split("_")[1]) ? 1 : 0;
    else if (name.startsWith("active_")) encoded[name] = raw.active === Number(name.split("_")[1]) ? 1 : 0;
    else if (name.startsWith("smoke_")) encoded[name] = raw.smoke === Number(name.split("_")[1]) ? 1 : 0;
  }
  const row = model.encoded_feature_columns.map((name) => encoded[name] ?? 0);
  const buffer = model.treeBuffer;
  const recordBytes = model.tree_record_bytes;
  let treeStart = 0;
  let sum = 0;
  for (const nodeCount of model.tree_node_counts) {
    let localIndex = 0;
    let guard = 0;
    while (localIndex >= 0 && localIndex < nodeCount && guard <= nodeCount) {
      const offset = (treeStart + localIndex) * recordBytes;
      const left = buffer.readUInt16LE(offset);
      const right = buffer.readUInt16LE(offset + 2);
      const feature = buffer.readInt8(offset + 4);
      if (feature < 0) {
        sum += buffer.readFloatLE(offset + 9);
        break;
      }
      const threshold = buffer.readFloatLE(offset + 5);
      localIndex = row[feature] <= threshold ? left : right;
      guard += 1;
    }
    treeStart += nodeCount;
  }
  return model.tree_node_counts.length ? sum / model.tree_node_counts.length : 0;
}

export function validateCardioInput(input: Record<string, number | boolean>): string | null {
  const required = ["age_years", "ap_hi", "ap_lo", "cholesterol", "active", "weight", "height", "smoke"];
  const missing = required.filter((key) => input[key] === undefined || input[key] === null || !Number.isFinite(Number(input[key])));
  if (missing.length) return `Missing or invalid inputs: ${missing.join(", ")}`;
  const ranges: Record<string, [number, number]> = {
    age_years: [18, 100], ap_hi: [60, 250], ap_lo: [30, 180],
    cholesterol: [1, 3], active: [0, 1], weight: [25, 300],
    height: [100, 230], smoke: [0, 1],
  };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const value = Number(input[key]);
    if (value < min || value > max || ((key === "cholesterol" || key === "active" || key === "smoke") && !Number.isInteger(value))) {
      return `Invalid value for ${key}; expected a value from ${min} to ${max}.`;
    }
  }
  return null;
}
