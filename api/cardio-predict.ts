import { getCardioModel, predictCardioProbability, validateCardioInput } from "../lib/cardio-model";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  const input = req.body as Record<string, number | boolean>;
  const validationError = validateCardioInput(input || {});
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  const model = await getCardioModel();
  if (!model) {
    res.status(503).json({ error: "The fitted cardiovascular model could not be loaded. Please try again shortly." });
    return;
  }
  const probability = predictCardioProbability(model, input);
  res.status(200).json({ probability, probabilityPercent: Number((probability * 100).toFixed(1)), model: model.model });
}
