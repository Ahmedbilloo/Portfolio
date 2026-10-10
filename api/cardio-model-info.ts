import { readFileSync } from "node:fs";
import { join } from "node:path";

export default function handler(_req: any, res: any) {
  try {
    const metadataPath = join(process.cwd(), "src", "data", "cardiovascular-rf-metadata.json");
    const model = JSON.parse(readFileSync(metadataPath, "utf8"));
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      model: model.model,
      target: model.target,
      targetMeaning: model.target_meaning,
      probabilityMeaning: model.probability_meaning,
      datasetRecords: model.dataset_records,
      datasetPositivePrevalence: model.dataset_positive_prevalence ?? null,
      testPositivePrevalence: model.test_positive_prevalence ?? null,
      testRocAuc: model.test_roc_auc,
      testBrierScore: model.test_brier_score,
      testLogLoss: model.test_log_loss,
      calibration: model.calibration || null,
      calibrationBins: model.calibration_bins || [],
      featureImportances: model.feature_importances,
      parameters: model.parameters,
    });
  } catch (error) {
    console.error("Cardio model metadata load failed:", error);
    res.status(503).json({ error: "Model metadata is temporarily unavailable." });
  }
}
