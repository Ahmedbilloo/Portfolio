import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

type Lang = "python" | "sql";

const KEYWORDS: Record<Lang, string[]> = {
  python: [
    "import","from","as","def","return","if","elif","else","for","while","in","not","and","or",
    "None","True","False","class","with","try","except","finally","lambda","print","pass","yield",
  ],
  sql: [
    "SELECT","FROM","WHERE","GROUP","BY","ORDER","JOIN","LEFT","RIGHT","INNER","OUTER","ON","AS",
    "WITH","HAVING","CASE","WHEN","THEN","ELSE","END","AND","OR","NOT","NULL","CREATE","TABLE",
    "VIEW","INSERT","INTO","VALUES","UPDATE","SET","DELETE","DISTINCT","UNION","ALL","OVER",
    "PARTITION","LIMIT","DESC","ASC",
  ],
};

type Token = { text: string; kind: "plain" | "keyword" | "string" | "comment" | "number" };

function tokenize(code: string, lang: Lang): Token[] {
  const keywords = KEYWORDS[lang];
  const pattern = new RegExp(
    [
      lang === "python" ? "(#[^\\n]*)" : "(--[^\\n]*)",
      "(\"\"\"[\\s\\S]*?\"\"\"|'[^'\\n]*'|\"[^\"\\n]*\")",
      `\\b(${keywords.join("|")})\\b`,
      "\\b(\\d+(?:\\.\\d+)?)\\b",
    ].join("|"),
    lang === "sql" ? "gi" : "g",
  );

  const tokens: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) {
    if (match.index > last) tokens.push({ text: code.slice(last, match.index), kind: "plain" });
    const kind: Token["kind"] = match[1]
      ? "comment"
      : match[2]
        ? "string"
        : match[3]
          ? "keyword"
          : "number";
    tokens.push({ text: match[0], kind });
    last = match.index + match[0].length;
  }
  if (last < code.length) tokens.push({ text: code.slice(last), kind: "plain" });
  return tokens;
}

const COLORS: Record<Token["kind"], string> = {
  plain: "text-code-fg",
  keyword: "text-code-keyword",
  string: "text-code-string",
  comment: "text-code-comment",
  number: "text-code-number",
};

export function CodeBlock({
  code,
  language = "python",
  filename,
}: {
  code: string;
  language?: Lang;
  filename?: string;
}) {
  const tokens = useMemo(() => tokenize(code.trim(), language), [code, language]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[11px] tracking-wide text-code-comment">
          {filename ?? (language === "sql" ? "query.sql" : "script.py")}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-code-comment transition-colors hover:text-code-fg"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[12.5px] leading-relaxed">
        <code className="font-mono">
          {tokens.map((t, i) => (
            <span key={i} className={COLORS[t.kind]}>
              {t.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
