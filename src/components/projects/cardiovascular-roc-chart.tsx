import { useMemo } from "react";

const models = [
  { name: "Logistic Regression", auc: 0.7911, stroke: "stroke-sky-500", dot: "bg-sky-500" },
  { name: "Decision Tree", auc: 0.7891, stroke: "stroke-violet-500", dot: "bg-violet-500" },
  { name: "Random Forest", auc: 0.7975, stroke: "stroke-emerald-500", dot: "bg-emerald-500" },
  { name: "Gradient Boosting", auc: 0.7858, stroke: "stroke-amber-500", dot: "bg-amber-500" },
  { name: "XGBoost", auc: 0.7892, stroke: "stroke-rose-500", dot: "bg-rose-500" },
];

const plot = { left: 56, top: 24, width: 420, height: 320 };

function curvePath(auc: number) {
  // Smooth ROC-shaped curve whose integrated area equals the notebook's reported AUC.
  const exponent = auc / (1 - auc);
  return Array.from({ length: 101 }, (_, i) => {
    const fpr = i / 100;
    const tpr = 1 - Math.pow(1 - fpr, exponent);
    const x = plot.left + fpr * plot.width;
    const y = plot.top + (1 - tpr) * plot.height;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

export function CardiovascularRocChart() {
  const paths = useMemo(() => models.map((model) => ({ ...model, path: curvePath(model.auc) })), []);

  return (
    <section className="card-surface space-y-5 p-5 sm:p-7" aria-labelledby="roc-chart-title">
      <div>
        <span className="eyebrow">Model Evaluation</span>
        <h2 id="roc-chart-title" className="mt-2 text-xl font-bold tracking-tight">ROC Curve Comparison</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Compare the five classifiers using the ROC-AUC values reported in the notebook. A curve closer to the upper-left corner generally indicates stronger discrimination.
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 520 405" role="img" aria-label="ROC curve comparison for Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, and XGBoost" className="mx-auto block w-full min-w-[320px] max-w-[620px]">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => {
            const x = plot.left + tick * plot.width;
            const y = plot.top + (1 - tick) * plot.height;
            return (
              <g key={tick}>
                <line x1={x} y1={plot.top} x2={x} y2={plot.top + plot.height} className="stroke-border" strokeWidth="1" />
                <line x1={plot.left} y1={y} x2={plot.left + plot.width} y2={y} className="stroke-border" strokeWidth="1" />
                <text x={x} y={plot.top + plot.height + 22} textAnchor="middle" className="fill-muted-foreground" fontSize="11">{tick.toFixed(1)}</text>
                <text x={plot.left - 12} y={y + 4} textAnchor="end" className="fill-muted-foreground" fontSize="11">{tick.toFixed(1)}</text>
              </g>
            );
          })}
          <line
            x1={plot.left} y1={plot.top + plot.height}
            x2={plot.left + plot.width} y2={plot.top}
            className="stroke-muted-foreground"
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />
          {paths.map((model) => (
            <path key={model.name} d={model.path} fill="none" className={model.stroke} strokeWidth="2.5" strokeLinecap="round" />
          ))}
          <text x={plot.left + plot.width / 2} y="392" textAnchor="middle" className="fill-foreground" fontSize="12">False Positive Rate</text>
          <text x="15" y={plot.top + plot.height / 2} textAnchor="middle" className="fill-foreground" fontSize="12" transform={`rotate(-90 15 ${plot.top + plot.height / 2})`}>True Positive Rate</text>
        </svg>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <div key={model.name} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className={`size-2.5 shrink-0 rounded-full ${model.dot}`} />
              <span className="truncate">{model.name}</span>
            </span>
            <span className="font-mono font-semibold tabular-nums">{model.auc.toFixed(4)}</span>
          </div>
        ))}
      </div>

    </section>
  );
}
