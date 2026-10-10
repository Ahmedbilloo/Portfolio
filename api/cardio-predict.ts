import { getCardioModel, predictCardioProbability, validateCardioInput } from "../lib/cardio-model";

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
    console.info("Cardio prediction: starting model load", { method: req.method });
    const model = await getCardioModel();
    if (!model) {
      res.status(503).json({ error: "Model loader returned unavailable. Metadata or the compressed tree artifact could not be loaded." });
      return;
    }
    console.info("Cardio prediction: model loaded", {
      trees: model.tree_node_counts.length,
      nodes: model.tree_node_counts.reduce((sum, count) => sum + count, 0),
      bytes: model.treeBuffer.byteLength
    });
    const probability = predictCardioProbability(model, input);
    res.status(200).json({
      ok: true,
      probability,
      probabilityPercent: Number((probability * 100).toFixed(1)),
      model: model.model,
      test: req.method === "GET"
    });
  } catch (error) {
    console.error("Cardio prediction failed:", error);
    res.status(500).json({
      error: "Prediction failed while loading or evaluating the fitted model.",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
}
