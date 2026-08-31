import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Code2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CodeViewerModal } from "@/components/code-viewer-modal";
import { projects } from "@/data/site";
import { projectDetails } from "@/data/project-details";

const TITLE = "Analytics & Machine Learning Projects — Ahmed Billoo";
const DESCRIPTION =
  "End-to-end case studies spanning retail analytics, demand forecasting, credit risk scoring, and healthcare predictive analytics.";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ProjectsIndexPage,
});

function ProjectsIndexPage() {
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string>("business-intelligence-forecasting");

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <SiteNav />

      <main className="pb-20">
        <header className="border-b border-border bg-surface/60">
          <div className="container-page py-12 sm:py-16">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back to Home
            </Link>
            <span className="eyebrow mt-6">Portfolio</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Featured Analytics &amp; ML Projects
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              End-to-end case studies spanning retail analytics, demand forecasting, credit risk scoring, and healthcare predictive analytics.
            </p>
          </div>
        </header>

        <div className="container-page mt-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => {
              const detail = projectDetails[p.slug];
              return (
                <article
                  key={p.slug}
                  className="card-surface flex flex-col justify-between p-6 transition-all hover:border-primary/40 hover:shadow-lg"
                >
                  <div>
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {p.category}
                    </span>
                    <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {p.description}
                    </p>

                    {detail && (
                      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4">
                        {detail.metrics.slice(0, 2).map((m, idx) => (
                          <div key={idx} className="rounded-lg border border-border bg-surface p-2.5">
                            <span className="text-[10px] text-muted-foreground">{m.label}</span>
                            <p className="text-sm font-bold text-primary">{m.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
                    <Link
                      to={p.to}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      View Case Study <ArrowRight className="size-3.5" />
                    </Link>
                    {p.slug === "retail-sales-intelligence" ? (
                      <Link
                        to={p.to}
                        hash="code"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <Code2 className="size-3.5" /> Show Code
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSlug(p.slug);
                          setCodeViewerOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <Code2 className="size-3.5" /> View Code
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      <CodeViewerModal
        isOpen={codeViewerOpen}
        onClose={() => setCodeViewerOpen(false)}
        initialSlug={selectedSlug}
      />

      <SiteFooter />
    </div>
  );
}
