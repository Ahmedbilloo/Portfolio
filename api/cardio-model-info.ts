import { getCardioModel } from "../lib/cardio-model";

export default function handler(_req: any, res: any) {
  const model = getCardioModel();
  if (!model) {
    res.status(503).json({ error: "The fitted cardiovascular model is not available yet." });
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
