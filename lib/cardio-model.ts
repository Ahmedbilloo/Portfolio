import fs from "node:fs";
import { gunzipSync } from "node:zlib";
import path from "node:path";

export type TreeNode = [number, number, number, number, number];
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
  trees: TreeNode[][];
};

export function getCardioModel(): CardioModel | null {
  try {
    return JSON.parse(gunzipSync(fs.readFileSync(path.join(process.cwd(), "src", "data", "cardiovascular-rf-model.json.gz"))).toString("utf8")) as CardioModel;
  } catch {
    return null;
  }
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
  let sum = 0;
  for (const tree of model.trees) {
    let nodeIndex = 0;
    let guard = 0;
    while (tree[nodeIndex] && tree[nodeIndex][2] >= 0 && guard < tree.length) {
      const node = tree[nodeIndex];
      nodeIndex = row[node[2]] <= node[3] ? node[0] : node[1];
      guard += 1;
    }
    sum += tree[nodeIndex]?.[4] ?? 0;
  }
  return model.trees.length ? sum / model.trees.length : 0;
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
