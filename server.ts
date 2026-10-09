import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

type TreeNode = { left: number; right: number; feature: number; threshold: number; p1: number };
type CardioModel = {
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

const MODEL_PATH = path.join(process.cwd(), "src", "data", "cardiovascular-rf-model.json");

function getModel(): CardioModel | null {
  try {
    return JSON.parse(fs.readFileSync(MODEL_PATH, "utf8")) as CardioModel;
  } catch {
    return null;
  }
}

function predictProbability(model: CardioModel, input: Record<string, number | boolean>): number {
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
    while (tree[nodeIndex] && tree[nodeIndex].feature >= 0 && guard < tree.length) {
      const node = tree[nodeIndex];
      nodeIndex = row[node.feature] <= node.threshold ? node.left : node.right;
      guard += 1;
    }
    sum += tree[nodeIndex]?.p1 ?? 0;
  }
  return model.trees.length ? sum / model.trees.length : 0;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Ahmed Billoo - Portfolio Applet",
      cardioModelLoaded: Boolean(getModel()),
    });
  });

  app.get("/api/cardio-model-info", (_req, res) => {
    const model = getModel();
    if (!model) {
      res.status(503).json({ error: "The fitted cardiovascular model is not available yet." });
      return;
    }
    res.json({
      model: model.model,
      target: model.target,
      targetMeaning: model.target_meaning,
      datasetRecords: model.dataset_records,
      testRocAuc: model.test_roc_auc,
      testBrierScore: model.test_brier_score,
      featureImportances: model.feature_importances,
      parameters: model.parameters,
    });
  });

  app.post("/api/cardio-predict", (req, res) => {
    const model = getModel();
    if (!model) {
      res.status(503).json({ error: "The fitted cardiovascular model is not available yet." });
      return;
    }
    const input = req.body as Record<string, number | boolean>;
    const required = ["age_years", "ap_hi", "ap_lo", "cholesterol", "active", "weight", "height", "smoke"];
    const missing = required.filter((key) => input[key] === undefined || input[key] === null || !Number.isFinite(Number(input[key])));
    if (missing.length) {
      res.status(400).json({ error: "Missing or invalid model inputs.", fields: missing });
      return;
    }
    const ranges: Record<string, [number, number]> = {
      age_years: [18, 100], ap_hi: [60, 250], ap_lo: [30, 180],
      cholesterol: [1, 3], active: [0, 1], weight: [25, 300],
      height: [100, 230], smoke: [0, 1],
    };
    for (const [key, [min, max]] of Object.entries(ranges)) {
      const value = Number(input[key]);
      if (value < min || value > max || ((key === "cholesterol" || key === "active" || key === "smoke") && !Number.isInteger(value))) {
        res.status(400).json({ error: `Invalid value for ${key}.`, range: [min, max] });
        return;
      }
    }
    const probability = predictProbability(model, input);
    res.json({ probability, probabilityPercent: Number((probability * 100).toFixed(1)), model: model.model });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
