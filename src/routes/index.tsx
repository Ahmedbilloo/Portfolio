import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Code2, Download, ImageIcon, Linkedin, Mail, Phone } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProfileHeadshot } from "@/components/profile-headshot";
import { projects, site } from "@/data/site";

const TITLE = "Ahmed Billoo — Data Analyst | Business Analytics Portfolio";
const DESCRIPTION =
  "Data Analyst and M.S. Business Analytics graduate. Dashboards, demand forecasting, and predictive analytics with SQL, Python, Tableau, Power BI, and R.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://ahmedbilloo.com/" },
    ],
    links: [{ rel: "canonical", href: "https://ahmedbilloo.com/" }],
  }),
  component: Home,
});

const experience = [
  {
    company: "Jawed Traders",
    role: "Operations Manager",
    period: "June 2021 – Present",
    location: "Karachi, Pakistan",
    points: [
      "Designed and implemented a Python-based demand forecasting model using time series analysis to optimize inventory planning, reducing stockouts by [[30%]].",
      "Developed an interactive Tableau Business Intelligence dashboard to monitor sales, inventory, lead times, safety stock, and operational KPIs, enabling data-driven procurement decisions.",
      "Reduced procurement lead times by [[25%]] through demand forecasting and data-driven inventory planning.",
      "Managed pharmaceutical distribution for [[100+ hospitals]] while collaborating with suppliers including GSK, Pfizer, and Abbott to maintain inventory availability and regulatory compliance.",
    ],
  },
  {
    company: "GoZayaan",
    role: "Supply Chain Associate",
    period: "January 2020 – June 2021",
    location: "Karachi, Pakistan",
    points: [
      "Supported the launch of two products by analyzing vendor data, pricing terms, and service capacity.",
      "Managed relationships with [[20+ vendors]] — local and international — to ensure timely service delivery.",
      "Analyzed vendor pricing and performance data to support negotiations and improve responsiveness.",
    ],
  },
];

const skills = [
  { group: "Programming", items: ["Python", "R", "SQL"] },
  { group: "Data Analysis", items: ["Pandas", "NumPy", "Excel"] },
  { group: "Visualization", items: ["Tableau", "Power BI", "Matplotlib", "ggplot2"] },
  { group: "Statistical Analysis", items: ["Regression", "Hypothesis Testing", "Forecasting"] },
  {
    group: "Machine Learning",
    items: ["Scikit-learn", "Random Forest", "Decision Trees", "Neural Networks", "Feature Engineering", "Model Evaluation", "Time Series Forecasting"],
  },
];

function Highlighted({ text }: { text: string }) {
  const parts = text.split(/\[\[(.+?)\]\]/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
    </div>
  );
}

function Home() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="container-page grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{site.name}</h1>
              <p className="mt-3 text-2xl font-medium tracking-tight text-primary sm:text-3xl">Data Analyst</p>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                M.S. in Business Analytics graduate and Data Analyst with 4+ years of experience in pharmaceutical distribution and supply chain operations. I combine hands-on business experience with data analytics to identify patterns, improve processes, and support better decision making. My work spans demand forecasting, inventory optimization, business intelligence, dashboard development, and predictive analytics, using Python, SQL, Tableau, Power BI, and R. I enjoy turning complex business data into practical insights that drive better decisions and measurable operational impact.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/" hash="projects" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  View Projects <ArrowRight className="size-4" />
                </Link>
                <a href={site.resumeUrl} download className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                  <Download className="size-4" /> Download Resume
                </a>
              </div>
            </div>

            <div className="justify-self-center lg:justify-self-center">
              <div className="w-64 rounded-3xl border border-border bg-card p-5 shadow-lg sm:w-80 sm:p-6">
                <ProfileHeadshot name={site.name} />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-muted-foreground">Education</p>
                    <p className="mt-2 text-sm font-semibold leading-snug text-foreground">M.S. Business Analytics</p>
                    <p className="mt-2 text-xs text-primary">CSU Sacramento</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-muted-foreground">Focus</p>
                    <p className="mt-2 text-sm font-semibold leading-snug text-foreground">Data Analytics &amp; ML</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="border-b border-border bg-surface">
          <div className="container-page py-20">
            <SectionHeading eyebrow="Projects" title="Selected analytics work" />
            <p className="mt-4 max-w-2xl text-[15px] text-muted-foreground">Each project has a dedicated case study covering the problem, data, approach, and code.</p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <article key={p.slug} className="card-surface group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
                  <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 border-b border-border bg-surface">
                    <ImageIcon className="size-5 text-muted-foreground" />
                    <p className="px-8 text-center text-[11px] text-muted-foreground">Screenshot placeholder</p>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="eyebrow">{p.category}</p>
                    <h3 className="mt-2.5 text-base font-semibold tracking-tight text-balance">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {p.tech.map((t) => <span key={t} className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">{t}</span>)}
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-2 pt-1">
                      <Link to={p.to} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">View Project <ArrowRight className="size-3.5" /></Link>
                      {p.codeUrl && <a href={p.codeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-accent"><Code2 className="size-3.5" /> View Code</a>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="border-b border-border">
          <div className="container-page grid gap-10 py-16 lg:grid-cols-[280px_minmax(0,1fr)]">
            <SectionHeading eyebrow="Experience" title="Professional experience" />
            <div className="space-y-8">
              {experience.map((job) => (
                <div key={job.company} className="card-surface p-6 sm:p-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <div><h3 className="text-base font-semibold tracking-tight">{job.company}</h3><p className="mt-0.5 text-sm text-primary">{job.role}</p></div>
                    <div className="text-sm text-muted-foreground sm:text-right"><p>{job.period}</p><p className="text-xs">{job.location}</p></div>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {job.points.map((p) => <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /><span><Highlighted text={p} /></span></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Education */}
        <section id="education" className="border-b border-border">
          <div className="container-page grid gap-10 py-16 lg:grid-cols-[280px_minmax(0,1fr)]">
            <SectionHeading eyebrow="Education" title="Education" />
            <div className="space-y-5">
              <div className="card-surface border-primary/30 p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"><h3 className="text-lg font-semibold tracking-tight">California State University, Sacramento</h3><p className="text-sm text-muted-foreground">June 2025</p></div>
                <p className="mt-1 text-sm font-medium text-primary">M.S. Business Analytics</p>
                <p className="mt-4 text-sm text-muted-foreground">Specialization: Data Analytics · Machine Learning · Statistical Modeling · Business Intelligence</p>
              </div>
              <div className="card-surface p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"><h3 className="text-base font-semibold tracking-tight">Institute of Business Administration, Karachi</h3><p className="text-sm text-muted-foreground">June 2021</p></div>
                <p className="mt-1 text-sm text-muted-foreground">B.B.A.</p><p className="mt-3 text-sm text-muted-foreground">Specialization: Finance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="border-b border-border">
          <div className="container-page grid gap-10 py-16 lg:grid-cols-[280px_minmax(0,1fr)]">
            <SectionHeading eyebrow="Skills" title="Technical skills" />
            <div className="grid gap-4 sm:grid-cols-2">
              {skills.map((s) => <div key={s.group} className="card-surface p-5"><p className="text-sm font-semibold tracking-tight">{s.group}</p><div className="mt-3 flex flex-wrap gap-1.5">{s.items.map((i) => <span key={i} className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground">{i}</span>)}</div></div>)}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact">
          <div className="container-page grid gap-10 py-16 lg:grid-cols-[280px_minmax(0,1fr)]">
            <SectionHeading eyebrow="Contact" title="Let's connect." />
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">I’m open to Data Analyst and Business Analytics opportunities. If you’re hiring or would like to discuss a project, feel free to reach out.</p>
                <div className="mt-6 space-y-3 text-sm">
                  <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"><Mail className="size-4" />{site.email}</a>
                  <a href={site.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"><Linkedin className="size-4" />LinkedIn</a>
                  {site.phone && <a href={`tel:${site.phone}`} className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"><Phone className="size-4" />{site.phone}</a>}
                </div>
              </div>
              <form className="card-surface space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div><label htmlFor="name" className="text-sm font-medium">Name</label><input id="name" name="name" required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary" placeholder="Your name" /></div>
                <div><label htmlFor="email" className="text-sm font-medium">Email</label><input id="email" name="email" type="email" required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary" placeholder="you@example.com" /></div>
                <div><label htmlFor="message" className="text-sm font-medium">Message</label><textarea id="message" name="message" required rows={5} className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary" placeholder="How can I help?" /></div>
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"><Mail className="size-4" />Send Message</button>
                {sent && <p className="text-center text-sm text-muted-foreground">Thanks — your message has been noted. This form is currently a front-end demo.</p>}
              </form>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
