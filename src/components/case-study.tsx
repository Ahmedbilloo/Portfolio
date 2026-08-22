import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Code2, ImageIcon } from "lucide-react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function CaseStudyLayout({
  title,
  category,
  description,
  tech,
  codeUrl,
  children,
}: {
  title: string;
  category: string;
  description: string;
  tech: string[];
  codeUrl?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <header className="border-b border-border bg-surface">
          <div className="container-page py-12 sm:py-16">
            <Link
              to="/"
              hash="projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              All projects
            </Link>
            <p className="eyebrow mt-8">{category}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {tech.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            {codeUrl && (
              <a
                href={codeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Code2 className="size-4" />
                View Code
              </a>
            )}
          </div>
        </header>

        <div className="container-page grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)]">
          <article className="max-w-3xl space-y-12">{children}</article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function Placeholder({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">To be added: </span>
      {label}
    </div>
  );
}

export function ImageSlot({ label, ratio = "aspect-[16/9]" }: { label: string; ratio?: string }) {
  return (
    <div
      className={`flex ${ratio} w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface`}
    >
      <ImageIcon className="size-5 text-muted-foreground" />
      <p className="px-6 text-center text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
