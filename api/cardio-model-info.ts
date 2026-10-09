import { getCardioModelMetadata } from "../lib/cardio-model";

export default function handler(_req: any, res: any) {
  const model = getCardioModelMetadata();
  if (!model) {
    res.status(503).json({ error: "The fitted cardiovascular model metadata is not available." });
    return;
  }
  res.status(200).json({
    model: model.model,
    target: model.target,
    targetMeaning: model.target_meaning,
    datasetRecords: model.dataset_records,
    testRocAuc: model.test_roc_auc,
    testBrierScore: model.test_brier_score,
    featureImportances: model.feature_importances,
    parameters: model.parameters,
  });
}
