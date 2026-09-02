import { useState } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, Code2, ExternalLink, Globe2, Lightbulb, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CodeBlock } from "@/components/code-block";

const sourceUrl = "https://archive.ics.uci.edu/dataset/352/online+retail";

const kpis = [
  { label: "Completed-sales revenue", value: "£10.64M", note: "After excluding cancellations and invalid sale lines" },
  { label: "Completed orders", value: "19,960", note: "Unique invoices in the analytical sales view" },
  { label: "Identified customers", value: "4,338", note: "Customer-level analysis uses identifiable customers" },
  { label: "Units sold", value: "5.57M", note: "Positive-quantity sale lines" },
  { label: "Average order value", value: "~£533", note: "Revenue divided by completed orders" },
  { label: "UK revenue share", value: "84.59%", note: "The domestic market dominates revenue" },
];

const productData = [
  { name: "Regency Cakestand 3 Tier", value: 164762.19 },
  { name: "White Hanging Heart T-Light Holder", value: 99668.47 },
  { name: "Party Bunting", value: 98302.98 },
  { name: "Jumbo Bag Red Retrospot", value: 92356.03 },
  { name: "Rabbit Night Light", value: 66756.59 },
];

const countryData = [
  { name: "United Kingdom", value: 84.59 },
  { name: "EIRE", value: 5.8 },
  { name: "Netherlands", value: 2.7 },
  { name: "Germany", value: 1.9 },
  { name: "Other markets", value: 5.01 },
];

const codeSnippets = [
  {
    title: "01 · Data Loading",
    description: "Load the complete UCI record set directly through the UCI ML Repository package.",
    code: `from ucimlrepo import fetch_ucirepo\n\n# Fetch UCI Online Retail (dataset ID 352)\nonline_retail = fetch_ucirepo(id=352)\n\n# Use the original 8-column transaction table\ndf = online_retail.data.original.copy()\n\nprint(df.shape)\nprint(df.head())`,
  },
  {
    title: "02 · Data Quality Audit",
    description: "Measure the issues that can materially affect sales and customer analysis before making cleaning decisions.",
    code: `# Missing values\nmissing = (\n    df.isna()\n      .sum()\n      .to_frame("missing_rows")\n      .assign(missing_pct=lambda x: x["missing_rows"] / len(df) * 100)\n      .sort_values("missing_rows", ascending=False)\n)\n\n# Exact duplicate rows\nduplicate_rows = df.duplicated().sum()\n\n# Cancellation / return signals\nis_cancelled = df["InvoiceNo"].astype(str).str.startswith("C")\nnegative_quantity = (df["Quantity"] < 0).sum()\ninvalid_price = (df["UnitPrice"] <= 0).sum()`,
  },
  {
    title: "03 · Feature Engineering",
    description: "Create the transaction-level revenue measure used throughout the business analysis.",
    code: `df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])\ndf["Revenue"] = df["Quantity"] * df["UnitPrice"]\n\n# Analytical sales view\nsales = df.loc[\n    (~df["InvoiceNo"].astype(str).str.startswith("C"))\n    & (df["Quantity"] > 0)\n    & (df["UnitPrice"] > 0)\n].drop_duplicates().copy()\n\n# Keep anonymous transactions for overall sales analysis.\n# Customer-level analysis is filtered to non-null CustomerID later.`,
  },
  {
    title: "04 · Sales Analysis",
    description: "Calculate the core commercial KPIs and monthly revenue trend.",
    code: `total_revenue = sales["Revenue"].sum()\norders = sales["InvoiceNo"].nunique()\nunits = sales["Quantity"].sum()\ncustomers = sales["CustomerID"].nunique()\naov = total_revenue / orders\n\nmonthly_revenue = (\n    sales.assign(Month=sales["InvoiceDate"].dt.to_period("M"))\n         .groupby("Month")["Revenue"]\n         .sum()\n         .reset_index()\n)`,
  },
  {
    title: "05 · Customer Analysis",
    description: "Build a customer-level view for value concentration and repeat-purchase analysis.",
    code: `customer_sales = sales.dropna(subset=["CustomerID"]).copy()\n\ncustomer_summary = (\n    customer_sales.groupby("CustomerID")\n    .agg(\n        Revenue=("Revenue", "sum"),\n        Orders=("InvoiceNo", "nunique"),\n        Units=("Quantity", "sum"),\n        FirstPurchase=("InvoiceDate", "min"),\n        LastPurchase=("InvoiceDate", "max"),\n    )\n    .reset_index()\n)\n\ncustomer_summary["RepeatCustomer"] = customer_summary["Orders"] > 1\nrepeat_rate = customer_summary["RepeatCustomer"].mean()`,
  },
];

function formatGBP(value: number) {
  return `£${value.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

export function RetailSalesIntelligence() {
  const [activeCode, setActiveCode] = useState(0);
  const maxProduct = productData[0].value;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <SiteNav />
      <main className="pb-20">
        <header className="border-b border-border bg-surface/60">
          <div className="container-page py-10 sm:py-14">
            <Link to="/" hash="projects" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-3.5" /> Back to all projects</Link>
            <div className="mt-6 flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Business Analytics</span><span className="text-xs text-muted-foreground">•</span><span className="text-xs text-muted-foreground">Python · Pandas · EDA</span></div>
            <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">Retail Sales Intelligence &amp; Customer Analytics</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">Turning 541,909 transaction-line records into a commercial view of sales performance, product concentration, customer value, seasonality, and market opportunity.</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">{["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Business Analytics"].map((tool) => <span key={tool} className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs">{tool}</span>)}</div>
            <div className="mt-7 flex flex-wrap gap-3"><a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-accent">UCI Dataset <ExternalLink className="size-3.5" /></a><a href="#code" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"><Code2 className="size-3.5" /> Show Code</a></div>
          </div>
        </header>
        <div className="container-page mt-12 space-y-16">
          <section><div className="flex items-center gap-2 text-primary"><BarChart3 className="size-5" /><h2 className="text-sm font-semibold uppercase tracking-wider">Executive Snapshot</h2></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{kpis.map((kpi) => <div key={kpi.label} className="card-surface p-5 transition-all hover:border-primary/40 hover:shadow-md"><span className="text-xs font-medium text-muted-foreground">{kpi.label}</span><p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{kpi.value}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{kpi.note}</p></div>)}</div></section>
          <section className="grid gap-8 lg:grid-cols-2">
            <div className="card-surface p-7"><div className="flex items-center gap-2 text-primary"><Users className="size-5" /><h2 className="text-lg font-bold tracking-tight">Business Question</h2></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Management needs to understand where revenue comes from, when demand peaks, which products drive sales, how dependent the business is on its highest-value customers, and which markets deserve attention.</p><div className="mt-5 border-t border-border pt-5"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Business Objective</p><p className="mt-2 text-sm leading-relaxed text-foreground">Understand sales performance, identify the products and customers driving revenue, and highlight opportunities across different markets.</p></div></div>
            <div className="card-surface p-7"><div className="flex items-center gap-2 text-primary"><Globe2 className="size-5" /><h2 className="text-lg font-bold tracking-tight">Dataset</h2></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">The UCI Online Retail dataset contains transactions from a UK-based non-store online retailer between 1 December 2010 and 9 December 2011. It contains 541,909 records and eight transaction fields.</p><div className="mt-5 grid grid-cols-2 gap-3 text-xs">{["541,909 rows", "8 fields", "38 countries", "Dec 2010–Dec 2011"].map((item) => <div key={item} className="rounded-lg border border-border bg-surface p-3 font-medium text-muted-foreground">{item}</div>)}</div></div>
          </section>
          <section><span className="text-xs font-semibold uppercase tracking-wider text-primary">Data Quality</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Cleaning decisions were driven by the business questions</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">The objective was not to blindly remove imperfect rows. Each issue was assessed according to whether it represented a valid business event or could distort the specific analysis being performed.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["135,080", "Missing CustomerID", "24.9% of rows"],["1,454", "Missing descriptions", "0.27% of rows"],["5,269", "Exact duplicates", "1.0% of rows"],["9,288", "Cancelled invoices", "Flagged as returns"],["2,517", "Zero/invalid prices", "Excluded from sales view"]].map(([value,label,note]) => <div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs font-semibold text-foreground">{label}</p><p className="mt-1 text-[11px] text-muted-foreground">{note}</p></div>)}</div></section>
          <section className="grid gap-8 lg:grid-cols-2">
            <div className="card-surface p-7"><span className="text-xs font-semibold uppercase tracking-wider text-primary">Product performance</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Top products by revenue</h2><p className="mt-2 text-xs text-muted-foreground">Service and postage codes are separated from the product story where appropriate.</p><div className="mt-6 space-y-4">{productData.map((product,index) => <div key={product.name}><div className="mb-1 flex items-center justify-between gap-4 text-xs"><span className="font-medium text-foreground">{index+1}. {product.name}</span><span className="shrink-0 font-semibold text-primary">{formatGBP(product.value)}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:`${(product.value/maxProduct)*100}%`}} /></div></div>)}</div></div>
            <div className="card-surface p-7"><span className="text-xs font-semibold uppercase tracking-wider text-primary">Market concentration</span><h2 className="mt-1 text-2xl font-bold tracking-tight">Revenue is heavily concentrated in the UK</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">The international share is meaningful, but no individual overseas market approaches the domestic revenue base.</p><div className="mt-7 space-y-4">{countryData.map((country) => <div key={country.name}><div className="mb-1 flex items-center justify-between text-xs"><span className="font-medium">{country.name}</span><span className="font-semibold text-primary">{country.value.toFixed(2)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:`${Math.max(country.value,2)}%`}} /></div></div>)}</div></div>
          </section>
          <section className="card-surface p-7"><span className="text-xs font-semibold uppercase tracking-wider text-primary">Seasonality</span><h2 className="mt-1 text-2xl font-bold tracking-tight">November is the commercial peak</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">The completed-sales view peaks in November 2011 at approximately <strong className="text-foreground">£1.50M</strong>. The broader dataset shows a pronounced September–November ramp, followed by a sharp December decline because the final month only contains transactions through 9 December.</p></section>
          <section id="code" className="scroll-mt-24"><div className="flex items-center gap-2 text-primary"><Code2 className="size-5"/><h2 className="text-2xl font-bold tracking-tight">Show Code</h2></div><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Selected Python used for the retail analysis.</p><div className="mt-6 overflow-hidden rounded-xl border border-border bg-card"><div className="flex flex-wrap border-b border-border">{codeSnippets.map((snippet,index)=><button key={snippet.title} onClick={()=>setActiveCode(index)} className={`px-4 py-3 text-xs font-semibold transition-colors ${activeCode===index?"bg-primary/10 text-primary":"text-muted-foreground hover:bg-accent hover:text-foreground"}`}>{snippet.title}</button>)}</div><div className="p-5"><p className="mb-3 text-sm text-muted-foreground">{codeSnippets[activeCode].description}</p><CodeBlock code={codeSnippets[activeCode].code} language="python" /></div></div></section>
          <section><div className="flex items-center gap-2 text-primary"><Lightbulb className="size-5"/><h2 className="text-2xl font-bold tracking-tight">Key Findings &amp; Recommendations</h2></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><div className="card-surface p-6"><div className="flex items-center gap-2"><CheckCircle2 className="size-5 text-primary"/><h3 className="font-bold">Findings</h3></div><ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground"><li>• Revenue is strongly concentrated in the UK market.</li><li>• A small group of products contributes a disproportionate share of sales.</li><li>• November is the strongest full month in the available period.</li><li>• Customer-level analysis depends on the subset of transactions with a CustomerID.</li></ul></div><div className="card-surface p-6"><h3 className="font-bold">Recommendations</h3><ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground"><li>• Prioritize availability of high-revenue products.</li><li>• Use customer value and purchase frequency to support retention efforts.</li><li>• Treat the UK as the core market while evaluating overseas growth opportunities.</li><li>• Use seasonal demand patterns when planning inventory and campaigns.</li></ul></div></div></section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
