import { ArrowRight, Download, Code2 } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProjectDetailView } from "@/components/project-detail-view";
import { ProfileHeadshot } from "@/components/profile-headshot";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { CodeViewerModal } from "@/components/code-viewer-modal";
import { projects, site } from "@/data/site";

export const Route = createFileRoute("/")({
  component: Home,
});

export default function Home() {
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string>("business-intelligence-forecasting");
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <section className="border-b border-border">
          <div className="container-page grid items-start gap-8 py-16 sm:py-24 lg:grid-cols-[1.35fr_1fr] lg:gap-10 lg:py-8 xl:py-12">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-5xl xl:text-6xl">{site.name}</h1>
              <p className="mt-3 text-2xl font-medium tracking-tight text-primary sm:text-3xl lg:mt-2 lg:text-2xl xl:text-3xl">Data Analyst</p>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base lg:mt-4 lg:text-[14.5px] xl:text-base">
                M.S. in Business Analytics graduate and Data Analyst with 4+ years of experience in pharmaceutical distribution and supply chain operations. I combine business expertise with data analytics to uncover insights, improve processes, and support smarter decisions. My work includes demand forecasting, inventory optimization, business intelligence, dashboard development, and predictive analytics using Python, SQL, Tableau, Power BI, and R. I turn complex data into practical insights that drive measurable business impact.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 lg:mt-5">
                <Link to="/" hash="projects" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  View Projects <ArrowRight className="size-4" />
                </Link>
                <a href={site.resumeUrl} download className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                  <Download className="size-4" /> Download Resume
                </a>
              </div>
            </div>

            <div className="justify-self-center lg:justify-self-end lg:mr-8 xl:mr-12 lg:-mt-2.5">
              <div className="w-72 rounded-3xl border border-border bg-card p-5 shadow-lg sm:w-80 sm:p-6 lg:w-[260px] xl:w-[285px] lg:p-3.5 xl:p-4.5">
                <ProfileHeadshot name={site.name} />
                <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-3 lg:gap-2 xl:mt-4 xl:gap-2.5">
                  <div className="rounded-xl border border-border bg-surface p-3.5 lg:p-2.5 xl:p-3">
                    <p className="text-xs text-muted-foreground">Education</p>
                    <p className="mt-2 text-sm font-semibold leading-snug text-foreground lg:mt-1 lg:text-xs xl:text-[13px]">M.S. Business Analytics</p>
                    <p className="mt-2 text-xs text-primary lg:mt-0.5 lg:text-[11px] xl:text-xs">CSU Sacramento</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3.5 lg:p-2.5 xl:p-3">
                    <p className="text-xs text-muted-foreground">Expertise</p>
                    <p className="mt-2 text-sm font-semibold leading-snug text-foreground lg:mt-1 lg:text-xs xl:text-[13px]">Data Analytics &amp; Machine Learning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="border-b border-border bg-surface">
          <div className="container-page py-20">
            <SectionHeading eyebrow="Projects" title="Selected analytics work" />
            <p className="mt-4 max-w-2xl text-[15px] text-muted-foreground">A selection of analytics projects using real datasets and practical business problems.</p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <article key={p.slug} className="card-surface group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
                  <div className="aspect-[16/10] overflow-hidden border-b border-border bg-surface">
                    {p.slug === "retail-sales-intelligence" ? (
                      <img src="/retail-sales-dashboard.svg" alt="Retail sales analytics dashboard preview" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    ) : (
                      <img src="/project-screenshot.svg" alt="Analytics dashboard preview" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="eyebrow">{p.category}</p>
                    <h3 className="mt-2.5 text-base font-semibold tracking-tight text-balance">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                    <div className="mt-5 flex flex-wrap gap-1.5">{p.tech.map((t) => <span key={t} className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">{t}</span>)}</div>
                    <div className="mt-6 flex flex-wrap items-center gap-2 pt-1">
                      <Link to={p.to} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">View Project <ArrowRight className="size-3.5" /></Link>
                      <button type="button" onClick={() => { setSelectedProjectSlug(p.slug); setCodeViewerOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"><Code2 className="size-3.5" /> View Code</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CodeViewerModal isOpen={codeViewerOpen} onClose={() => setCodeViewerOpen(false)} initialSlug={selectedProjectSlug} />

        <section id="experience" className="border-b border-border"><div className="container-page grid gap-10 py-16 lg:grid-cols-[280px_minmax(0,1fr)]"><SectionHeading eyebrow="Experience" title="Professional experience" /><div className="space-y-8"><div className="card-surface p-6 sm:p-7"><div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"><div><h3 className="text-base font-semibold tracking-tight">Jawed Traders</h3><p className="mt-0.5 text-sm text-primary">Operations Manager</p></div><div className="text-sm text-muted-foreground sm:text-right"><p>June 2021 – Present</p><p className="text-xs">Karachi, Pakistan</p></div></div><ul className="mt-5 space-y-3"><li className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /><span>Designed and implemented a Python-based demand forecasting model using time series analysis to optimize inventory planning, reducing stockouts by <strong>30%</strong>.</span></li><li className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /><span>Developed an interactive Tableau Business Intelligence dashboard to monitor sales, inventory, lead times, safety stock, and operational KPIs, enabling data-driven procurement decisions.</span></li><li className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /><span>Reduced procurement lead times by <strong>25%</strong> through demand forecasting and data-driven inventory planning.</span></li></ul></div></div></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
