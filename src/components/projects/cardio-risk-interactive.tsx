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
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"calculator" | "model">("calculator");

  const bmi = useMemo(() => height > 0 ? weight / ((height / 100) ** 2) : 0, [height, weight]);
  const meanArterialPressure = Math.round(diastolicBP + (systolicBP - diastolicBP) / 3);
  const pulsePressure = systolicBP - diastolicBP;

  useEffect(() => {
    if (
      !Number.isFinite(ageYears) || !Number.isFinite(systolicBP) ||
      !Number.isFinite(diastolicBP) || !Number.isFinite(weight) ||
      !Number.isFinite(height) || ageYears <= 0 || weight <= 0 || height <= 0 ||
      systolicBP <= diastolicBP || systolicBP - diastolicBP < 10
    ) {
      setProbability(null);
      setError("Enter valid age, height, weight, and blood pressure values to calculate the model output.");
      return;
    }

    setError(null);
    // These coefficients come from the final unstandardized Logistic Regression model.
    // Indicator columns reproduce pandas get_dummies() for cholesterol, active, and smoke.
    const z =
      -4.585065232959666 +
      0.051857 * ageYears +
      0.057058 * systolicBP +
      0.011620 * diastolicBP +
      0.010125 * weight -
      0.004024 * height +
      (cholesterol === 1 ? -1.970848 : 0) +
      (cholesterol === 2 ? -1.596530 : 0) +
      (cholesterol === 3 ? -1.017687 : 0) +
      (isActive ? -2.400257 : -2.184809) +
      (isSmoker ? -2.391265 : -2.193800);

    const boundedZ = Math.max(-500, Math.min(500, z));
    setProbability(1 / (1 + Math.exp(-boundedZ)));
  }, [ageYears, systolicBP, diastolicBP, cholesterol, isSmoker, isActive, weight, height]);


  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <HeartPulse className="size-3.5" /> Machine Learning Demo
          </span>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Cardiovascular Disease Model
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Logistic Regression · unstandardized inputs
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
              <p className="text-xs text-muted-foreground">Estimated probability of the recorded dataset label</p>
              <div className="mt-2">
                {loading && probability === null ? <div className="text-2xl font-semibold text-muted-foreground">Calculating…</div> : (
                  <span className="text-5xl font-extrabold tracking-tight text-primary">{probability === null ? "—" : `${(probability * 100).toFixed(1)}%`}</span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Calculated locally using the fitted Logistic Regression coefficients.</p>
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
            <div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">Estimator</p><p className="mt-1 font-semibold text-foreground">Logistic Regression</p><p className="mt-1 text-[10px] text-muted-foreground">L2 regularization · C = 10</p></div>
            <div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">Accuracy</p><p className="mt-1 text-2xl font-bold text-foreground">72.69%</p><p className="mt-1 text-[10px] text-muted-foreground">Held-out test set</p></div>
            <div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">F1-score</p><p className="mt-1 text-2xl font-bold text-foreground">0.709</p><p className="mt-1 text-[10px] text-muted-foreground">Held-out test set</p></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">Precision</p><p className="mt-1 text-xl font-bold text-foreground">74.86%</p></div>
            <div className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">Recall</p><p className="mt-1 text-xl font-bold text-foreground">67.26%</p></div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">The calculator uses age, systolic and diastolic blood pressure, weight, height, cholesterol category, physical activity, and smoking status. Categorical variables are encoded with indicator columns matching pandas get_dummies().</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">Educational demonstration only. The output estimates the probability of the recorded label in the source dataset and is not a clinical diagnosis.</p>
        </div>
      )}
    </div>
  );
}
