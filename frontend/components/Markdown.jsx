import { cn } from "@/lib/utils";

// Minimal, dependency-free Markdown renderer for AI-generated documents.
// Supports: # ## ### headings, **bold**, - / * bullet lists, | tables |, paragraphs.

function Inline({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function Markdown({ content = "", className }) {
  const lines = String(content).replace(/\r/g, "").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2];
      const Tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      const size = level === 1 ? "text-2xl mt-1" : level === 2 ? "text-xl mt-5" : "text-lg mt-4";
      blocks.push(<Tag key={i} className={cn("font-display font-semibold text-ink", size)}>{h[2]}</Tag>);
      i++;
      continue;
    }

    // table (consecutive | lines)
    if (line.trim().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i]);
        i++;
      }
      const parse = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const header = parse(rows[0]);
      const bodyRows = rows.slice(1).filter((r) => !/^\|[\s|:-]+\|?$/.test(r.trim())).map(parse);
      blocks.push(
        <div key={`t${i}`} className="my-3 overflow-hidden rounded-xl border border-sand">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>{header.map((c, x) => <th key={x} className="px-3 py-2 font-semibold">{c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {bodyRows.map((row, y) => (
                <tr key={y} className="bg-paper-soft">
                  {row.map((c, x) => <td key={x} className="px-3 py-2 text-ink-soft"><Inline text={c} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`l${i}`} className="my-2 space-y-1.5">
          {items.map((it, x) => (
            <li key={x} className="flex gap-2.5 text-sm text-ink-soft">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              <span><Inline text={it} /></span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // paragraph
    blocks.push(<p key={i} className="my-2 text-sm leading-relaxed text-ink-soft"><Inline text={line} /></p>);
    i++;
  }

  return <div className={cn("space-y-0.5", className)}>{blocks}</div>;
}
