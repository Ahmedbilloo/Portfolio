export default async function handler(_req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  res.status(503).json({
    error: "Predictions are temporarily disabled while the model and its probability calibration are being validated. No probability is being shown rather than presenting an unverified number."
  });
}
