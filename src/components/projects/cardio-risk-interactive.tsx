import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { HeartPulse, AlertCircle, CheckCircle2, Sliders, Stethoscope } from "lucide-react";

type ModelInfo = {
  model: string;
  target: string;
  targetMeaning: string;
  datasetRecords: number;
  testRocAuc: number;
  testBrierScore: number;
  featureImportances: Record<string, number>;
};

export function CardioRiskInteractive() {
  const [ageYears, setAgeYears] = useState(54);
  const [systolicBP, setSystolicBP] = useState(142);
  const [diastolicBP, setDiastolicBP] = useState(90);
  const [cholesterol, setCholesterol] = useState<1 | 2 | 3>(2);
  const [weight, setWeight] = useState(78);
  const [height, setHeight] = useState(170);
  const [isSmoker, setIsSmoker] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [probability, setProbability] = useState<number | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"calculator" | "model">("calculator");

  const bmi = useMemo(() => height > 0 ? weight / ((height / 100) ** 2) : 0, [height, weight]);
  const meanArterialPressure = Math.round(diastolicBP + (systolicBP - diastolicBP) / 3);
  const pulsePressure = systolicBP - diastolicBP;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cardio-model-info")
      .then(async (response) => {
        if (!response.ok) throw new Error("The fitted model is not available on the live server yet.");
        return response.json();
      })
      .then((data: ModelInfo) => { if (!cancelled) setModelInfo(data); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch("/api/cardio-predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        age_years: ageYears,
        ap_hi: systolicBP,
        ap_lo: diastolicBP,
        cholesterol,
        active: Number(isActive),
        weight,
        height,
        smoke: Number(isSmoker),
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Prediction failed.");
        return data;
      })
      .then((data: { probability: number }) => {
        if (!cancelled) setProbability(data.probability);
      })
      .catch((e: Error) => {
        if (!cancelled && e.name !== "AbortError") {
          setError(e.message);
          setProbability(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [ageYears, systolicBP, diastolicBP, cholesterol, isSmoker, isActive, weight, height]);

  const importanceData = useMemo(() => {
    if (!modelInfo) return [];
    const labels: Record<string, string> = {
      age_years: "Age",
      ap_hi: "Systolic BP",
      ap_lo: "Diastolic BP",
      weight: "Weight",
      height: "Height",
      cholesterol_1: "Cholesterol: normal",
      cholesterol_2: "Cholesterol: above normal",
      cholesterol_3: "Cholesterol: high",
      active_0: "Physical activity: no",
      active_1: "Physical activity: yes",
      smoke_0: "Non-smoker",
      smoke_1: "Smoker",
    };
    return Object.entries(modelInfo.featureImportances)
      .map(([key, value]) => ({ feature: labels[key] || key, importance: Number((value * 100).toFixed(2)) }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 8);
  }, [modelInfo]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <HeartPulse className="size-3.5" /> Machine Learning Demo
          </span>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Cardiovascular Disease Probability
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Predictions from the trained Random Forest using eight demographic, clinical, and lifestyle inputs.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`rounded-lg px-3 py-1.5 transition-all ${activeTab === "calculator" ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-surface text-muted-foreground hover:text-foreground"}`}
          >
            Probability calculator
          </button>
          <button
            onClick={() => setActiveTab("model")}
            className={`rounded-lg px-3 py-1.5 transition-all ${activeTab === "model" ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-surface text-muted-foreground hover:text-foreground"}`}
          >
            Model details
          </button>
        </div>
      </div>

      {activeTab === "calculator" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 rounded-xl border border-border bg-surface p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sliders className="size-4 text-primary" /> Model input features
            </h4>
            <div>
              <div className="flex justify-between text-xs">
                <label htmlFor="cardio-age" className="font-medium text-foreground">Age</label>
                <span className="font-bold text-primary">{ageYears} years</span>
              </div>
              <input id="cardio-age" type="range" min="18" max="100" value={ageYears} onChange={(e) => setAgeYears(Number(e.target.value))} className="mt-1.5 w-full accent-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs"><label htmlFor="cardio-sbp" className="font-medium text-foreground">Systolic BP</label><span className="font-bold text-primary">{systolicBP}</span></div>
                <input id="cardio-sbp" type="range" min="60" max="250" value={systolicBP} onChange={(e) => setSystolicBP(Number(e.target.value))} className="mt-1.5 w-full accent-primary" />
                <p className="text-[10px] text-muted-foreground">mmHg (ap_hi)</p>
              </div>
              <div>
                <div className="flex justify-between text-xs"><label htmlFor="cardio-dbp" className="font-medium text-foreground">Diastolic BP</label><span className="font-bold text-primary">{diastolicBP}</span></div>
                <input id="cardio-dbp" type="range" min="30" max="180" value={diastolicBP} onChange={(e) => setDiastolicBP(Number(e.target.value))} className="mt-1.5 w-full accent-primary" />
                <p className="text-[10px] text-muted-foreground">mmHg (ap_lo)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cardio-cholesterol" className="text-xs font-medium text-foreground">Cholesterol category</label>
                <select id="cardio-cholesterol" value={cholesterol} onChange={(e) => setCholesterol(Number(e.target.value) as 1 | 2 | 3)} className="mt-1 w-full rounded-lg border border-border bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary">
                  <option value={1}>1 — Normal</option>
                  <option value={2}>2 — Above normal</option>
                  <option value={3}>3 — High</option>
                </select>
              </div>
              <div>
                <label htmlFor="cardio-weight" className="text-xs font-medium text-foreground">Weight (kg)</label>
                <input id="cardio-weight" type="number" min="25" max="300" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-border bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label htmlFor="cardio-height" className="text-xs font-medium text-foreground">Height (cm)</label>
                <input id="cardio-height" type="number" min="100" max="230" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-border bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary" />
              </div>
              <div className="rounded-lg border border-border bg-card px-3 py-2">
                <p className="text-xs font-medium text-foreground">Calculated BMI</p>
                <p className="mt-1 text-sm font-semibold text-primary">{Number.isFinite(bmi) ? bmi.toFixed(1) : "—"}</p>
                <p className="text-[10px] text-muted-foreground">Display only; not a model input</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setIsSmoker(!isSmoker)} aria-pressed={isSmoker} className={`rounded-lg border py-2.5 text-xs font-medium transition-all ${isSmoker ? "border-rose-500 bg-rose-500/10 text-rose-600" : "border-border bg-card text-muted-foreground"}`}>
                {isSmoker ? "Smoker: Yes" : "Smoker: No"}
              </button>
              <button type="button" onClick={() => setIsActive(!isActive)} aria-pressed={isActive} className={`rounded-lg border py-2.5 text-xs font-medium transition-all ${isActive ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-border bg-card text-muted-foreground"}`}>
                {isActive ? "Physically active: Yes" : "Physically active: No"}
              </button>
            </div>
            <div className="flex gap-2 rounded-lg border border-border bg-card p-3 text-xs">
              <div className="flex-1 text-center"><p className="text-muted-foreground">Mean arterial pressure</p><p className="font-semibold text-foreground">{meanArterialPressure} mmHg</p></div>
              <div className="border-r border-border" />
              <div className="flex-1 text-center"><p className="text-muted-foreground">Pulse pressure</p><p className="font-semibold text-foreground">{pulsePressure} mmHg</p></div>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model output</span>

            </div>
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">Predicted probability of recorded cardiovascular disease</p>
              <div className="mt-2">
                {loading && probability === null ? <div className="text-2xl font-semibold text-muted-foreground">Calculating…</div> : (
                  <span className="text-5xl font-extrabold tracking-tight text-primary">{probability === null ? "—" : `${(probability * 100).toFixed(1)}%`}</span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Probability from the fitted Random Forest; not a five-year forecast.</p>
            </div>
            {error && <div role="status" className="mt-6 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div>}
            {!error && probability !== null && <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /><span>This is a model estimate of the dataset's recorded disease label, not a clinical diagnosis or a calibrated estimate of future risk.</span></div>}
            <div className="mt-6 flex items-start gap-2 border-t border-border pt-4 text-[10px] leading-relaxed text-muted-foreground"><Stethoscope className="mt-0.5 size-3.5 shrink-0" /><span>Educational demonstration only. Do not use this output for diagnosis or treatment decisions.</span></div>
          </div>
        </div>
      )}

      {activeTab === "model" && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">Estimator</p><p className="mt-1 font-semibold text-foreground">{modelInfo?.model || "Random Forest"}</p><p className="mt-1 text-[10px] text-muted-foreground">500 trees · balanced class weights</p></div>
            <div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">Held-out ROC-AUC</p><p className="mt-1 text-2xl font-bold text-foreground">{modelInfo ? modelInfo.testRocAuc.toFixed(3) : "—"}</p><p className="mt-1 text-[10px] text-muted-foreground">20% stratified test split</p></div>
            <div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">Held-out Brier score</p><p className="mt-1 text-2xl font-bold text-foreground">{modelInfo ? modelInfo.testBrierScore.toFixed(3) : "—"}</p><p className="mt-1 text-[10px] text-muted-foreground">Lower is better for probability error</p></div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{modelInfo ? `Trained on ${modelInfo.datasetRecords.toLocaleString()} records. Target: ${modelInfo.targetMeaning}. The dataset is cross-sectional, so this model estimates the probability of the recorded label rather than a future time horizon.` : "Waiting for model metadata from the server."}</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importanceData} layout="vertical" margin={{ top: 8, right: 20, bottom: 8, left: 130 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="feature" width={125} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, "Feature importance"]} />
                <Bar dataKey="importance" fill="#0f766e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground">Feature importance describes how the fitted forest used the encoded features; it does not imply causation. Metrics and importances are loaded from the exported fitted model artifact.</p>
        </div>
      )}
    </div>
  );
}
