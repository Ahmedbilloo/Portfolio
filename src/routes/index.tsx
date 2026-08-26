import { ArrowRight, Download } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProjectDetailView } from "@/components/project-detail-view";
import { ProfileHeadshot } from "@/components/profile-headshot";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { projects, site } from "@/data/site";

export default function Home() {
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string>("business-intelligence-forecasting");

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <section className="border-b border-border">
          <div className="container-page grid items-start gap-12 py-16 sm:py-24 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{site.name}</h1>
              <p className="mt-3 text-2xl font-medium tracking-tight text-primary sm:text-3xl">Data Analyst</p>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">M.S. in Business Analytics graduate and Data Analyst with 4+ years of experience in pharmaceutical distribution and supply chain operations. I combine business expertise with data analytics to uncover insights, improve processes, and support smarter decisions. My work includes demand forecasting, inventory optimization, business intelligence, dashboard development, and predictive analytics using Python, SQL, Tableau, Power BI, and R. I turn complex data into practical insights that drive measurable business impact.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/" hash="projects" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">View Projects <ArrowRight className="size-4" /></Link>
                <a href={site.resumeUrl} download className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"><Download className="size-4" /> Download Resume</a>
              </div>
            </div>
            <div className="justify-self-center lg:justify-self-end lg:-mt-6 lg:translate-x-16">
              <div className="w-[28rem] max-w-full rounded-3xl border border-border bg-card p-5 shadow-lg sm:p-6">
                <ProfileHeadshot name={site.name} />
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-surface p-3.5"><p className="text-xs text-muted-foreground">Education</p><p className="mt-2 text-sm font-semibold leading-snug text-foreground">M.S. Business Analytics</p><p className="mt-2 text-xs text-primary">CSU Sacramento</p></div>
                  <div className="rounded-xl border border-border bg-surface p-3.5"><p className="text-xs text-muted-foreground">Expertise</p><p className="mt-2 text-sm font-semibold leading-snug text-foreground">Data Analytics &amp; Machine Learning</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="border-b border-border bg-surface"><div className="container-page py-16 sm:py-24"><div className="flex flex-col gap-2"><p className="eyebrow">Projects</p><h2 className="text-3xl font-semibold tracking-tight">Selected analytics work</h2></div><div className="mt-10 grid gap-6 lg:grid-cols-3">{projects.map((project) => (<button key={project.slug} type="button" onClick={() => setSelectedProjectSlug(project.slug)} className="text-left"><article className="card-surface h-full overflow-hidden transition-transform hover:-translate-y-1"><div className="aspect-[16/10] bg-muted/40 p-4"><div className="flex h-full items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">{project.title}</div></div><div className="p-5"><p className="text-xs font-medium uppercase tracking-wider text-primary">{project.category}</p><h3 className="mt-2 text-lg font-semibold">{project.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.description}</p></div></article></button>))}</div><div className="mt-10"><ProjectDetailView project={projects.find((p) => p.slug === selectedProjectSlug) ?? projects[0]} /></div></div></section>
        <section id="experience" className="border-b border-border"><div className="container-page py-16 sm:py-24"><p className="eyebrow">Experience</p><div className="mt-8 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]"><div><h2 className="text-3xl font-semibold tracking-tight">Operations + analytics</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">I bring hands-on operational context to analytics work, translating business needs into measurable models, dashboards, and process improvements.</p></div><div className="card-surface p-6"><div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><h3 className="text-lg font-semibold">Operations Manager · Jawed Traders</h3><span className="text-sm text-muted-foreground">2020 — Present</span></div><ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground"><li>Implemented demand forecasting and safety-stock models in Python, reducing stockouts by 30%.</li><li>Built KPI dashboards in Tableau to improve visibility into sales, inventory, and fulfillment.</li><li>Improved operational workflows and reduced lead time by 25% through data-driven process changes.</li></ul></div></div></div></section>
        <section id="education" className="border-b border-border bg-surface"><div className="container-page py-16 sm:py-24"><p className="eyebrow">Education</p><div className="mt-8 grid gap-6 sm:grid-cols-2"><div className="card-surface p-6"><p className="text-sm font-medium text-primary">2025</p><h3 className="mt-2 text-xl font-semibold">M.S. Business Analytics</h3><p className="mt-1 text-sm text-muted-foreground">California State University, Sacramento</p></div><div className="card-surface p-6"><p className="text-sm font-medium text-primary">2021</p><h3 className="mt-2 text-xl font-semibold">B.B.A. Finance</h3><p className="mt-1 text-sm text-muted-foreground">Institute of Business Administration, Karachi</p></div></div></div></section>
        <section id="skills" className="border-b border-border"><div className="container-page py-16 sm:py-24"><p className="eyebrow">Skills</p><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><div className="card-surface p-6"><h3 className="font-semibold">Data Analytics</h3><p className="mt-2 text-sm text-muted-foreground">Python, SQL, R, Excel, data cleaning, exploratory analysis</p></div><div className="card-surface p-6"><h3 className="font-semibold">Statistical Analysis</h3><p className="mt-2 text-sm text-muted-foreground">Regression, hypothesis testing, statistical modeling, predictive analytics</p></div><div className="card-surface p-6"><h3 className="font-semibold">Machine Learning</h3><p className="mt-2 text-sm text-muted-foreground">Scikit-learn, classification, regression, clustering, model evaluation</p></div><div className="card-surface p-6"><h3 className="font-semibold">Business Intelligence</h3><p className="mt-2 text-sm text-muted-foreground">Tableau, Power BI, dashboard development, KPI reporting</p></div><div className="card-surface p-6"><h3 className="font-semibold">Data Management</h3><p className="mt-2 text-sm text-muted-foreground">SQL Server, ETL, data warehousing, data preparation</p></div><div className="card-surface p-6"><h3 className="font-semibold">Business &amp; Operations</h3><p className="mt-2 text-sm text-muted-foreground">Demand forecasting, inventory optimization, process improvement</p></div></div></div></section>
        <section id="contact" className="border-b border-border bg-surface"><div className="container-page py-16 sm:py-24"><p className="eyebrow">Contact</p><div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-3xl font-semibold tracking-tight">Let’s connect</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">I’m open to data analytics opportunities, collaborative projects, and conversations about applying analytics to real business problems.</p></div><a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">Email me <ArrowRight className="size-4" /></a></div></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
