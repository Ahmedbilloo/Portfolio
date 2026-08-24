import { useState, useMemo, useEffect } from "react";
import { X, Copy, Check, FileCode } from "lucide-react";

interface PythonCodeFile {
  filename: string;
  projectName: string;
  description: string;
  code: string;
}

const pythonCodeByProject: Record<string, PythonCodeFile> = {
  "business-intelligence-forecasting": {
    filename: "sarimax_demand_forecasting.py",
    projectName: "Business Intelligence & Demand Forecasting",
    description: "SARIMAX Time-Series Demand Forecasting Pipeline with Exogenous Variables",
    code: `"""
SARIMAX Time-Series Demand Forecasting Pipeline
Project: Pharmaceutical Supply Chain BI & Demand Forecasting Platform
Author: Ahmed Billoo (Lead Analytics Specialist)
"""

import logging
from typing import Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def train_and_forecast_sku(
    ts_data: pd.Series,
    exog_data: Optional[pd.DataFrame] = None,
    forecast_periods: int = 90,
    order: Tuple[int, int, int] = (1, 1, 2),
    seasonal_order: Tuple[int, int, int, int] = (1, 1, 1, 7),
    confidence_level: float = 0.95
) -> Dict[str, Any]:
    """
    Fits a SARIMAX time-series model on historical daily demand
    and returns projections, 95% confidence intervals, and validation metrics.
    """
    logging.info(f"Training SARIMAX{order}x{seasonal_order} on {len(ts_data)} daily observations.")

    # 80/20 Chronological train-test split for out-of-time validation
    split_idx = int(len(ts_data) * 0.8)
    train, test = ts_data.iloc[:split_idx], ts_data.iloc[split_idx:]
    
    exog_train = exog_data.iloc[:split_idx] if exog_data is not None else None
    exog_test = exog_data.iloc[split_idx:] if exog_data is not None else None

    # Step 1: Model validation on test holdout
    val_model = SARIMAX(
        train,
        exog=exog_train,
        order=order,
        seasonal_order=seasonal_order,
        enforce_stationarity=False,
        enforce_invertibility=False
    )
    val_fitted = val_model.fit(disp=False, maxiter=200)

    # Generate test predictions
    test_pred = val_fitted.forecast(steps=len(test), exog=exog_test)
    test_pred_clipped = np.maximum(test_pred, 0) # Drug demand cannot be negative

    mape = mean_absolute_percentage_error(test, test_pred_clipped)
    rmse = np.sqrt(mean_squared_error(test, test_pred_clipped))
    logging.info(f"Validation Results -> Test MAPE: {mape:.4f} | Test RMSE: {rmse:.2f}")

    # Step 2: Refit on entire dataset for production future forecast
    full_model = SARIMAX(
        ts_data,
        exog=exog_data,
        order=order,
        seasonal_order=seasonal_order,
        enforce_stationarity=False,
        enforce_invertibility=False
    )
    full_fitted = full_model.fit(disp=False, maxiter=250)

    # Step 3: Project into future 90-day window
    forecast_res = full_fitted.get_forecast(steps=forecast_periods)
    pred_mean = np.maximum(forecast_res.predicted_mean, 0)
    conf_int = forecast_res.conf_int(alpha=1 - confidence_level)

    forecast_df = pd.DataFrame({
        "forecast_units": np.round(pred_mean, 1),
        "ci_lower": np.round(np.maximum(conf_int.iloc[:, 0], 0), 1),
        "ci_upper": np.round(conf_int.iloc[:, 1], 1)
    })

    return {
        "metrics": {
            "test_mape_pct": round(float(mape) * 100, 2),
            "test_rmse": round(float(rmse), 2),
            "aic": round(float(full_fitted.aic), 2),
            "bic": round(float(full_fitted.bic), 2)
        },
        "parameters": {
            "order": order,
            "seasonal_order": seasonal_order,
            "horizon_days": forecast_periods
        },
        "forecast": forecast_df
    }`,
  },

  "loan-default-prediction": {
    filename: "credit_risk_pipeline.py",
    projectName: "Loan Default Prediction & Credit Risk Scoring",
    description: "Scikit-Learn ML Pipeline with SMOTE Oversampling and Random Forest Classifier",
    code: `"""
Machine Learning Credit Risk & Loan Default Prediction Pipeline
Project: Credit Risk Scoring on 50,000+ Borrower Portfolio
Author: Ahmed Billoo (Lead Analytics Specialist)
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

def build_and_evaluate_credit_pipeline(csv_path: str):
    print("Loading borrower credit portfolio dataset...")
    df = pd.read_csv(csv_path)

    # 1. Domain Feature Engineering
    # Interaction: Revolving debt relative to annual earning power
    df['revolving_to_income_ratio'] = df['revol_bal'] / (df['annual_inc'] + 1e-5)
    # Velocity: Inquiry velocity per open credit line
    df['inquiry_density'] = df['inq_last_6mths'] / (df['open_acc'] + 1)
    # Payment Burden: Monthly installment as % of monthly income
    df['monthly_income'] = df['annual_inc'] / 12.0
    df['installment_burden'] = df['installment'] / (df['monthly_income'] + 1e-5)

    feature_cols = [
        'fico_score', 'dti', 'annual_inc', 'loan_amnt', 'int_rate',
        'revol_util', 'total_acc', 'revolving_to_income_ratio', 
        'inquiry_density', 'installment_burden'
    ]

    X = df[feature_cols]
    y = df['is_default']  # Binary target: 1 = Defaulted, 0 = Fully Paid

    # 2. Stratified 80/20 Holdout Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 3. Encapsulated Pipeline with SMOTE to prevent cross-fold data leakage
    pipeline = ImbPipeline([
        ('scaler', StandardScaler()),
        ('smote', SMOTE(sampling_strategy=0.5, random_state=42)),
        ('classifier', RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_split=8,
            min_samples_leaf=4,
            class_weight='balanced_subsample',
            random_state=42,
            n_jobs=-1
        ))
    ])

    # 4. Train Model
    print("Training Random Forest ensemble with SMOTE...")
    pipeline.fit(X_train, y_train)

    # 5. Out-of-Time Test Holdout Evaluation
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    
    # Asymmetric Cost Optimization: Default loss (4x) vs. lost interest (1x)
    optimal_threshold = 0.38
    y_pred_custom = (y_pred_proba >= optimal_threshold).astype(int)

    auc_score = roc_auc_score(y_test, y_pred_proba)
    report = classification_report(y_test, y_pred_custom, output_dict=True)
    cm = confusion_matrix(y_test, y_pred_custom)

    print("=" * 50)
    print(f"ROC-AUC Score: {auc_score:.4f}")
    print(f"Default Detection Recall (Class 1): {report['1']['recall']:.4f}")
    print(f"Default Precision (Class 1): {report['1']['precision']:.4f}")
    print(f"F1-Score: {report['1']['f1-score']:.4f}")
    print("=" * 50)

    return pipeline, auc_score, cm, report`,
  },

  "cardiovascular-risk-prediction": {
    filename: "cardio_model_training.py",
    projectName: "Cardiovascular Disease Risk Prediction",
    description: "Clinical Biometric Risk Modeling with Hemodynamic Biomarkers and Recall Calibration",
    code: `"""
Cardiovascular Disease Diagnostic Risk Modeling
Dataset: 70,000 Patient Electronic Health Records (EHR)
Author: Ahmed Billoo (Lead Analytics Specialist)
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import RobustScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, recall_score, precision_score, f1_score, classification_report

def train_cardiovascular_diagnostic_models(df: pd.DataFrame):
    print(f"Raw patient records: {len(df)}")

    # 1. Clinical Data Hygiene: Filter non-viable ambulatory measurements
    df = df[(df['ap_hi'] >= 80) & (df['ap_hi'] <= 220)].copy()
    df = df[(df['ap_lo'] >= 50) & (df['ap_lo'] <= 140)].copy()
    df = df[df['ap_hi'] > df['ap_lo']].copy()

    # 2. Hemodynamic & Metabolic Feature Engineering
    df['age_years'] = df['age'] / 365.25
    df['bmi'] = df['weight'] / ((df['height'] / 100.0) ** 2)
    # Mean Arterial Pressure (MAP): Average pressure across one cardiac cycle
    df['map'] = df['ap_lo'] + (df['ap_hi'] - df['ap_lo']) / 3.0
    # Pulse Pressure: Indicator of vascular stiffening
    df['pulse_pressure'] = df['ap_hi'] - df['ap_lo']

    features = [
        'age_years', 'gender', 'ap_hi', 'ap_lo', 'map', 'pulse_pressure',
        'bmi', 'cholesterol', 'gluc', 'smoke', 'alco', 'active'
    ]
    X = df[features]
    y = df['cardio'] # 1 = CVD present, 0 = CVD absent

    # 3. Stratified 80/20 Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 4. Robust Scaling to prevent clinical outlier distortion
    scaler = RobustScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 5. Train Random Forest Classifier
    rf = RandomForestClassifier(
        n_estimators=250,
        max_depth=10,
        min_samples_leaf=4,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train_scaled, y_train)

    # 6. Clinical Screening Threshold Calibration (Prioritize Sensitivity / Recall)
    rf_probas = rf.predict_proba(X_test_scaled)[:, 1]
    clinical_threshold = 0.42 # Tuned to minimize missed diagnoses in preventive care
    rf_preds = (rf_probas >= clinical_threshold).astype(int)

    auc = roc_auc_score(y_test, rf_probas)
    recall = recall_score(y_test, rf_preds)
    precision = precision_score(y_test, rf_preds)
    f1 = f1_score(y_test, rf_preds)

    print("=" * 50)
    print("=== Random Forest Clinical Benchmark ===")
    print(f"ROC-AUC: {auc:.4f}")
    print(f"Clinical Recall (Sensitivity): {recall * 100:.1f}%")
    print(f"Precision: {precision * 100:.1f}%")
    print(f"F1-Score: {f1:.4f}")
    print("=" * 50)

    return rf, scaler, features, auc, recall`,
  },
};

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlug?: string;
}

export function CodeViewerModal({
  isOpen,
  onClose,
  initialSlug = "business-intelligence-forecasting",
}: CodeViewerModalProps) {
  const [copied, setCopied] = useState(false);

  // Pick current project Python file
  const fileData = useMemo(() => {
    return (
      pythonCodeByProject[initialSlug] ||
      pythonCodeByProject["business-intelligence-forecasting"]
    );
  }, [initialSlug]);

  const lines = useMemo(() => {
    return fileData.code.split("\n");
  }, [fileData]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fileData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="code-viewer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8"
    >
      {/* Background Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Code Window Container */}
      <div className="relative z-10 flex h-[88vh] max-h-[820px] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-zinc-700/70 bg-[#0d1117] text-[#c9d1d9] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Simple Header Bar */}
        <div className="flex h-13 shrink-0 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 sm:px-5">
          {/* File Name & Language */}
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCode className="size-4.5 text-[#e3b341] shrink-0" />
            <span
              id="code-viewer-title"
              className="font-mono text-sm font-semibold text-[#f0f6fc] truncate"
            >
              {fileData.filename}
            </span>
            <span className="rounded bg-[#238636]/20 px-2 py-0.5 text-[11px] font-medium text-[#7ee787] border border-[#238636]/40 hidden sm:inline-block">
              Python
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] border border-[#30363d]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close code window"
              className="rounded-md p-1.5 text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc] transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Code Canvas with Line Numbers */}
        <div className="flex-1 overflow-auto bg-[#0d1117] font-mono text-[13px] leading-[22px]">
          <div className="flex min-w-full">
            {/* Line Numbers Column */}
            <div
              aria-hidden="true"
              className="select-none shrink-0 border-r border-[#30363d] bg-[#0d1117] py-4 text-right font-mono text-[12px] text-[#484f58]"
              style={{ minWidth: "3.25rem", paddingRight: "0.75rem", paddingLeft: "0.5rem" }}
            >
              {lines.map((_, index) => (
                <div key={index} className="h-[22px]">
                  {index + 1}
                </div>
              ))}
            </div>

            {/* Python Code Content */}
            <div className="flex-1 py-4 pl-4 pr-6 overflow-x-auto whitespace-pre">
              {lines.map((line, idx) => (
                <div key={idx} className="h-[22px] hover:bg-[#161b22]/50">
                  {renderPythonLine(line)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simple Footer Status */}
        <div className="flex h-8 shrink-0 items-center justify-between border-t border-[#30363d] bg-[#161b22] px-4 text-xs text-[#8b949e]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 inline-block" />
            <span className="font-sans text-[11px] truncate max-w-xs sm:max-w-md text-[#8b949e]">
              {fileData.projectName}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>{lines.length} lines</span>
            <span>Python 3.10+</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// Clean Python Syntax Line Renderer
function renderPythonLine(line: string) {
  if (!line) return <span>&nbsp;</span>;

  const trimmed = line.trimStart();

  // Python comment or docstring line
  if (trimmed.startsWith("#")) {
    return <span className="text-[#8b949e] italic">{line}</span>;
  }
  if (trimmed.startsWith('"""') || trimmed.endsWith('"""')) {
    return <span className="text-[#a5d6ff] italic">{line}</span>;
  }

  const pyKeywords = [
    "import", "from", "as", "def", "return", "if", "elif", "else", "for",
    "while", "in", "not", "and", "or", "None", "True", "False", "class",
    "with", "try", "except", "finally", "lambda", "print", "pass", "yield",
    "dict", "list", "tuple", "float", "int", "str", "bool", "Optional", "Dict", "Any", "Tuple"
  ];

  const regex = new RegExp(
    [
      "(\"[^\"]*\"|'[^']*')",               // Strings
      `\\b(${pyKeywords.join("|")})\\b`,    // Keywords
      "\\b(\\d+(?:\\.\\d+)?)\\b",           // Numbers
    ].join("|"),
    "g"
  );

  const parts: { text: string; kind: "plain" | "keyword" | "string" | "number" }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: line.slice(lastIndex, match.index), kind: "plain" });
    }
    const kind = match[1] ? "string" : match[2] ? "keyword" : "number";
    parts.push({ text: match[0], kind });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    parts.push({ text: line.slice(lastIndex), kind: "plain" });
  }

  return (
    <span>
      {parts.map((p, i) => {
        let colorClass = "text-[#c9d1d9]";
        if (p.kind === "keyword") colorClass = "text-[#ff7b72] font-semibold";
        if (p.kind === "string") colorClass = "text-[#a5d6ff]";
        if (p.kind === "number") colorClass = "text-[#79c0ff]";

        return (
          <span key={i} className={colorClass}>
            {p.text}
          </span>
        );
      })}
    </span>
  );
}
