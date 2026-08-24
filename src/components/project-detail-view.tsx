import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Calendar,
  User,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  Cpu,
  Layers,
  BarChart4,
  Briefcase,
  GitBranch,
  FolderGit2,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CodeBlock } from "@/components/code-block";
import { CodeViewerModal } from "@/components/code-viewer-modal";
import { projectDetails, ProjectDetail } from "@/data/project-details";
import { projects } from "@/data/site";
import { BiForecastInteractive } from "@/components/projects/bi-forecast-interactive";
import { LoanDefaultInteractive } from "@/components/projects/loan-default-interactive";
import { CardioRiskInteractive } from "@/components/projects/cardio-risk-interactive";

export function ProjectDetailView({ slug }: { slug: string }) {
  const detail: ProjectDetail | undefined = projectDetails[slug] || projectDetails["business-intelligence-forecasting"];
  const [activeCodeIndex, setActiveCodeIndex] = useState<number>(0);
  const [codeViewerOpen, setCodeViewerOpen] = useState<boolean>(false);

  // Next and Previous projects for fluid navigation
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <SiteNav />

      <main className="pb-20">
        {/* Header Hero Section */}
        <header className="border-b border-border bg-surface/60">
          <div className="container-page py-10 sm:py-14">
            <Link
              to="/"
              hash="projects"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back to all projects
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {detail.category}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5" /> {detail.timeline}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="size-3.5" /> {detail.role}
              </span>
            </div>

            <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {detail.title}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {detail.tagline}
            </p>

            {/* Tools Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {detail.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs"
                >
                  {tool}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCodeViewerOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Code2 className="size-4" /> View Python Code
              </button>
              <Link
                to="/"
                hash="contact"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
              >
                Inquire About This Work <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Primary Container */}
        <div className="container-page mt-12 space-y-16">
          {/* Key Metrics Bento Grid */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Key Results &amp; Quantified Impact
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {detail.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="card-surface flex flex-col justify-between p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                      {m.value}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-border pt-3">
                    {m.change && (
                      <span className="inline-block rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {m.change}
                      </span>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Simulator / Tool Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Interactive Project Demo</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Explore working simulations and models built for this analytics platform.
                </p>
              </div>
            </div>

            {slug === "business-intelligence-forecasting" && <BiForecastInteractive />}
            {slug === "loan-default-prediction" && <LoanDefaultInteractive />}
            {slug === "cardiovascular-risk-prediction" && <CardioRiskInteractive />}
          </section>

          {/* Business Problem & Challenges */}
          <section className="grid gap-8 lg:grid-cols-2">
            <div className="card-surface p-7">
              <div className="flex items-center gap-2 text-primary">
                <Briefcase className="size-5" />
                <h2 className="text-lg font-bold tracking-tight text-foreground">The Business Challenge</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {detail.problemStatement}
              </p>
            </div>

            <div className="card-surface p-7">
              <div className="flex items-center gap-2 text-amber-500">
                <Layers className="size-5" />
                <h2 className="text-lg font-bold tracking-tight text-foreground">Key Technical Constraints</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {detail.keyChallenges.map((challenge, i) => (
                  <li key={i} className="flex gap-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Solution & Step-by-Step Methodology */}
          <section className="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">System Architecture</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                Methodology &amp; Implementation Lifecycle
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {detail.solutionOverview}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {detail.methodologySteps.map((step) => (
                <div key={step.step} className="card-surface flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                        PHASE {step.step}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <ul className="mt-4 space-y-2 border-t border-border pt-4">
                    {step.details.map((d, di) => (
                      <li key={di} className="flex gap-2 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Working Code Snippets Tab */}
          <section className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Code Artifacts</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                Production Code &amp; Query Implementations
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Examine the underlying SQL stored procedures and Python machine learning pipelines powering this project.
              </p>
            </div>

            {/* Code Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex flex-wrap gap-2">
                {detail.codeSnippets.map((snippet, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCodeIndex(idx)}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                      activeCodeIndex === idx
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Code2 className="size-3.5" />
                    <span>{snippet.title.split(":")[0]}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCodeViewerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Code2 className="size-3.5 text-primary" />
                <span>View Full Python File</span>
              </button>
            </div>

            {detail.codeSnippets[activeCodeIndex] && (
              <div className="space-y-3">
                <div className="rounded-lg border border-border/80 bg-surface/70 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {detail.codeSnippets[activeCodeIndex].title}:{" "}
                  </span>
                  {detail.codeSnippets[activeCodeIndex].description}
                </div>
                <CodeBlock
                  code={detail.codeSnippets[activeCodeIndex].code}
                  language={detail.codeSnippets[activeCodeIndex].language}
                  filename={detail.codeSnippets[activeCodeIndex].title}
                />
              </div>
            )}
          </section>

          {/* Model Benchmarking Table (If available) */}
          {detail.modelResults && (
            <section className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Model Evaluation</span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  Cross-Validated Classification Benchmarks
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Quantitative performance comparison across candidate machine learning algorithms on out-of-time validation sets.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-surface text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Algorithm / Model</th>
                      <th className="px-4 py-3 font-semibold">Accuracy</th>
                      <th className="px-4 py-3 font-semibold">Precision</th>
                      <th className="px-4 py-3 font-semibold">Recall (Sensitivity)</th>
                      <th className="px-4 py-3 font-semibold">F1-Score</th>
                      <th className="px-4 py-3 font-semibold">ROC-AUC</th>
                      <th className="px-4 py-3 font-semibold">Assessment Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {detail.modelResults.map((r, i) => (
                      <tr
                        key={i}
                        className={`transition-colors ${
                          r.model.includes("Selected") ? "bg-primary/5 font-medium" : "hover:bg-surface/50"
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {r.model}
                          {r.model.includes("Selected") && (
                            <span className="ml-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">
                              Selected
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.accuracy}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.precision}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{r.recall}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.f1Score}</td>
                        <td className="px-4 py-3 font-bold text-primary">{r.rocAuc}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Business Impact & ROI Cards */}
          <section className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Measurable ROI</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                Delivered Business Impact
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {detail.businessImpact.map((item, idx) => (
                <div key={idx} className="card-surface p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {item.title}
                  </span>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {item.metric}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Learnings & Takeaways */}
          <section className="card-surface p-7">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="size-5" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">Key Technical Takeaways</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {detail.keyLearnings.map((learning, i) => (
                <div key={i} className="rounded-xl border border-border/80 bg-surface/60 p-4 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">0{i + 1}. </span>
                  {learning}
                </div>
              ))}
            </div>
          </section>

          {/* Project Navigation Footer */}
          <section className="border-t border-border pt-10">
            <div className="grid gap-4 sm:grid-cols-2">
              {prevProject ? (
                <Link
                  to={prevProject.to}
                  className="card-surface group flex items-center gap-4 p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <ArrowLeft className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:text-primary" />
                  <div>
                    <span className="text-[11px] text-muted-foreground">Previous Project</span>
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary">
                      {prevProject.title}
                    </h4>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextProject ? (
                <Link
                  to={nextProject.to}
                  className="card-surface group flex items-center justify-between p-5 text-right transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="text-left">
                    <span className="text-[11px] text-muted-foreground">Next Project</span>
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary">
                      {nextProject.title}
                    </h4>
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Code Viewer Sub-Window */}
      <CodeViewerModal
        isOpen={codeViewerOpen}
        onClose={() => setCodeViewerOpen(false)}
        initialSlug={slug}
      />

      <SiteFooter />
    </div>
  );
}
