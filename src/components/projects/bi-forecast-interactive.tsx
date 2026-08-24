import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { Sliders, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, Package, Clock, ShieldCheck } from "lucide-react";

interface SKUData {
  id: string;
  name: string;
  category: string;
  baseDemand: number;
  seasonality: number;
  leadTimeDays: number;
  unitCost: number;
  data: {
    month: string;
    actual?: number;
    forecast?: number;
    ciLower?: number;
    ciUpper?: number;
  }[];
}

const SKU_LIST: SKUData[] = [
  {
    id: "SKU-ONC-042",
    name: "Paclitaxel 100mg (Oncology Infusion)",
    category: "Oncology",
    baseDemand: 420,
    seasonality: 1.15,
    leadTimeDays: 28,
    unitCost: 145,
    data: [
      { month: "Jan", actual: 380 },
      { month: "Feb", actual: 410 },
      { month: "Mar", actual: 435 },
      { month: "Apr", actual: 395 },
      { month: "May", actual: 450 },
      { month: "Jun", actual: 470 },
      { month: "Jul", actual: 460, forecast: 460, ciLower: 430, ciUpper: 490 },
      { month: "Aug", forecast: 495, ciLower: 455, ciUpper: 535 },
      { month: "Sep", forecast: 510, ciLower: 465, ciUpper: 555 },
      { month: "Oct", forecast: 480, ciLower: 430, ciUpper: 530 },
      { month: "Nov", forecast: 525, ciLower: 470, ciUpper: 580 },
      { month: "Dec", forecast: 560, ciLower: 495, ciUpper: 625 },
    ],
  },
  {
    id: "SKU-CAR-118",
    name: "Atorvastatin 20mg (Cardiovascular Tablets)",
    category: "Cardiology",
    baseDemand: 1250,
    seasonality: 1.05,
    leadTimeDays: 14,
    unitCost: 32,
    data: [
      { month: "Jan", actual: 1200 },
      { month: "Feb", actual: 1240 },
      { month: "Mar", actual: 1280 },
      { month: "Apr", actual: 1220 },
      { month: "May", actual: 1310 },
      { month: "Jun", actual: 1290 },
      { month: "Jul", actual: 1300, forecast: 1300, ciLower: 1240, ciUpper: 1360 },
      { month: "Aug", forecast: 1340, ciLower: 1270, ciUpper: 1410 },
      { month: "Sep", forecast: 1360, ciLower: 1280, ciUpper: 1440 },
      { month: "Oct", forecast: 1380, ciLower: 1290, ciUpper: 1470 },
      { month: "Nov", forecast: 1410, ciLower: 1310, ciUpper: 1510 },
      { month: "Dec", forecast: 1450, ciLower: 1340, ciUpper: 1560 },
    ],
  },
  {
    id: "SKU-ANT-089",
    name: "Meropenem 1g (Critical Care IV)",
    category: "Antibiotics",
    baseDemand: 680,
    seasonality: 1.25,
    leadTimeDays: 21,
    unitCost: 88,
    data: [
      { month: "Jan", actual: 720 },
      { month: "Feb", actual: 690 },
      { month: "Mar", actual: 640 },
      { month: "Apr", actual: 610 },
      { month: "May", actual: 590 },
      { month: "Jun", actual: 630 },
      { month: "Jul", actual: 660, forecast: 660, ciLower: 610, ciUpper: 710 },
      { month: "Aug", forecast: 700, ciLower: 640, ciUpper: 760 },
      { month: "Sep", forecast: 750, ciLower: 680, ciUpper: 820 },
      { month: "Oct", forecast: 810, ciLower: 730, ciUpper: 890 },
      { month: "Nov", forecast: 860, ciLower: 770, ciUpper: 950 },
      { month: "Dec", forecast: 890, ciLower: 790, ciUpper: 990 },
    ],
  },
];

export function BiForecastInteractive() {
  const [selectedSkuId, setSelectedSkuId] = useState<string>("SKU-ONC-042");
  const [serviceLevelZ, setServiceLevelZ] = useState<number>(1.96); // 97.5%
  const [leadTimeBufferDays, setLeadTimeBufferDays] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"forecast" | "pipeline" | "reorder">("forecast");

  const currentSku = useMemo(() => {
    return SKU_LIST.find((s) => s.id === selectedSkuId) || SKU_LIST[0];
  }, [selectedSkuId]);

  // Dynamic calculations
  const avgDailyDemand = useMemo(() => currentSku.baseDemand / 30, [currentSku]);
  const effectiveLeadTime = useMemo(() => currentSku.leadTimeDays + leadTimeBufferDays, [currentSku, leadTimeBufferDays]);

  const safetyStock = useMemo(() => {
    const demandStdDev = avgDailyDemand * 0.22;
    const leadTimeStdDev = 2.5;
    const ss = serviceLevelZ * Math.sqrt(effectiveLeadTime * Math.pow(demandStdDev, 2) + Math.pow(avgDailyDemand, 2) * Math.pow(leadTimeStdDev, 2));
    return Math.round(ss);
  }, [avgDailyDemand, effectiveLeadTime, serviceLevelZ]);

  const reorderPoint = useMemo(() => {
    return Math.round(avgDailyDemand * effectiveLeadTime + safetyStock);
  }, [avgDailyDemand, effectiveLeadTime, safetyStock]);

  const annualHoldingCost = useMemo(() => {
    // Approx 18% annual inventory holding cost rate
    return Math.round(safetyStock * currentSku.unitCost * 0.18);
  }, [safetyStock, currentSku]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <TrendingUp className="size-3.5" /> Interactive BI Simulation Tool
          </span>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            SARIMAX Demand Forecasting &amp; Dynamic Reorder Engine
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a critical pharmaceutical SKU to view 90-day time-series projections, confidence intervals, and safety stock recalculations.
          </p>
        </div>

        {/* SKU Selector */}
        <div className="flex flex-wrap gap-2">
          {SKU_LIST.map((sku) => (
            <button
              key={sku.id}
              onClick={() => setSelectedSkuId(sku.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedSkuId === sku.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {sku.category}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-2 border-b border-border pb-3 text-xs font-medium">
        <button
          onClick={() => setActiveTab("forecast")}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            activeTab === "forecast" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Time-Series Forecast Chart
        </button>
        <button
          onClick={() => setActiveTab("reorder")}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            activeTab === "reorder" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Reorder Point &amp; Safety Stock Live Calculator
        </button>
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            activeTab === "pipeline" ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ETL Architecture Flow
        </button>
      </div>

      {/* Content based on tab */}
      {activeTab === "forecast" && (
        <div className="mt-6 space-y-6">
          {/* Active SKU Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-surface/80 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{currentSku.id}</p>
              <h4 className="text-sm font-semibold text-foreground">{currentSku.name}</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">Category: {currentSku.category} · Unit Cost: ${currentSku.unitCost}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="rounded-lg border border-border bg-card px-3 py-1.5 text-center">
                <span className="text-muted-foreground">Avg Monthly Demand</span>
                <p className="text-sm font-semibold text-foreground">{currentSku.baseDemand} units</p>
              </div>
              <div className="rounded-lg border border-border bg-card px-3 py-1.5 text-center">
                <span className="text-muted-foreground">Supplier Lead Time</span>
                <p className="text-sm font-semibold text-foreground">{currentSku.leadTimeDays} days</p>
              </div>
              <div className="rounded-lg border border-border bg-card px-3 py-1.5 text-center">
                <span className="text-muted-foreground">Forecast Model</span>
                <p className="text-sm font-semibold text-primary">SARIMAX(1,1,2)(1,1,1)7</p>
              </div>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={currentSku.data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-card p-2.5 text-xs shadow-md">
                          <p className="font-semibold text-foreground">{label}</p>
                          {data.actual !== undefined && (
                            <p className="text-emerald-500">Historical Actual: {data.actual} units</p>
                          )}
                          {data.forecast !== undefined && (
                            <p className="text-primary font-medium">SARIMAX Forecast: {data.forecast} units</p>
                          )}
                          {data.ciLower !== undefined && (
                            <p className="text-muted-foreground">95% CI Range: [{data.ciLower} – {data.ciUpper}]</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                {/* Confidence interval area */}
                <Area
                  type="monotone"
                  dataKey="ciUpper"
                  stroke="none"
                  fill="oklch(0.55 0.18 258 / 0.12)"
                  name="95% Confidence Interval Band"
                />
                <Area
                  type="monotone"
                  dataKey="ciLower"
                  stroke="none"
                  fill="transparent"
                />
                {/* Historical Actual Line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981" }}
                  name="Historical Actual Orders"
                />
                {/* Forecast Line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="oklch(0.55 0.18 258)"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: "oklch(0.55 0.18 258)" }}
                  name="Projected SARIMAX Demand"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "reorder" && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Sliders */}
            <div className="space-y-5 rounded-xl border border-border bg-surface p-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sliders className="size-4 text-primary" /> Parameter Controls
              </h4>

              <div>
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">Target Service Level (Z-Factor)</span>
                  <span className="font-semibold text-primary">{serviceLevelZ === 1.65 ? "95.0% (Z=1.65)" : serviceLevelZ === 1.96 ? "97.5% (Z=1.96)" : "99.0% (Z=2.33)"}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  {[
                    { label: "95%", z: 1.65 },
                    { label: "97.5%", z: 1.96 },
                    { label: "99%", z: 2.33 },
                  ].map((lvl) => (
                    <button
                      key={lvl.label}
                      onClick={() => setServiceLevelZ(lvl.z)}
                      className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${
                        serviceLevelZ === lvl.z
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Higher service levels protect against ICU stockouts with larger safety buffers.</p>
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">Supplier Lead Time Buffer Adjustment</span>
                  <span className="font-semibold text-foreground">+{leadTimeBufferDays} Days (Total: {effectiveLeadTime}d)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="21"
                  step="1"
                  value={leadTimeBufferDays}
                  onChange={(e) => setLeadTimeBufferDays(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Simulates supply chain shipping delays and port customs clearance bottlenecks.</p>
              </div>
            </div>

            {/* Live KPI Outputs */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-4" />
                  <span className="text-xs font-medium">Recommended Safety Stock</span>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{safetyStock} <span className="text-xs font-normal text-muted-foreground">units</span></p>
                <p className="mt-1 text-[11px] text-muted-foreground">Buffer to absorb hospital demand spikes</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Package className="size-4" />
                  <span className="text-xs font-medium">Dynamic Reorder Point</span>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{reorderPoint} <span className="text-xs font-normal text-muted-foreground">units</span></p>
                <p className="mt-1 text-[11px] text-muted-foreground">Trigger PO when on-hand hits this level</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-amber-500">
                  <Clock className="size-4" />
                  <span className="text-xs font-medium">Effective Lead Time</span>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{effectiveLeadTime} <span className="text-xs font-normal text-muted-foreground">days</span></p>
                <p className="mt-1 text-[11px] text-muted-foreground">Vendor dispatch to hospital delivery</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-500">
                  <TrendingUp className="size-4" />
                  <span className="text-xs font-medium">Est. Annual Holding Cost</span>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">${annualHoldingCost.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/ yr</span></p>
                <p className="mt-1 text-[11px] text-muted-foreground">Based on 18% capital carrying rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <span className="inline-block rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">STEP 1</span>
              <h5 className="mt-2 text-xs font-semibold text-foreground">ERP Raw Ingestion</h5>
              <p className="mt-1 text-[11px] text-muted-foreground">Nightly batch dump of 4.2M order rows into SQL staging schema.</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">STEP 2</span>
              <h5 className="mt-2 text-xs font-semibold text-foreground">Tableau Prep ETL</h5>
              <p className="mt-1 text-[11px] text-muted-foreground">Cleans outliers, standardizes SKUs, and builds dimensional star schema.</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <span className="inline-block rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600">STEP 3</span>
              <h5 className="mt-2 text-xs font-semibold text-foreground">Python SARIMAX Engine</h5>
              <p className="mt-1 text-[11px] text-muted-foreground">Computes 90-day time-series forecasts with 95% confidence intervals.</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <span className="inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">STEP 4</span>
              <h5 className="mt-2 text-xs font-semibold text-foreground">Tableau Dashboard &amp; Alerts</h5>
              <p className="mt-1 text-[11px] text-muted-foreground">Delivers interactive executive views and auto-triggers procurement POs.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
