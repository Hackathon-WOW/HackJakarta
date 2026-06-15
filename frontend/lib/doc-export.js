// Convert our Markdown subset to an HTML string + open a print-ready (PDF) document window.

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(text) {
  return esc(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function mdToHtml(md = "") {
  const lines = String(md).replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
      i++;
      continue;
    }

    if (line.trim().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(lines[i]); i++; }
      const parse = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const header = parse(rows[0]);
      const body = rows.slice(1).filter((r) => !/^\|[\s|:-]+\|?$/.test(r.trim())).map(parse);
      out.push(
        `<table><thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body
          .map((row) => `<tr>${row.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table>`,
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push(`<ul>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</ul>`);
      continue;
    }

    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  return out.join("\n");
}

export function downloadMarkdown(filename, md) {
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Open a clean, print-ready document window and trigger the print/save-as-PDF dialog. */
export function openPrintableDocument({ title, company, subtitle, markdown }) {
  const date = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  w.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 22mm 20mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #15241c; line-height: 1.6; margin: 0; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 40px 28px; }
  .kop { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #18392b; padding-bottom: 14px; margin-bottom: 8px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .mark { width: 30px; height: 30px; border-radius: 8px; background: #18392b; display: grid; place-items: center; }
  .mark span { display:inline-block; width:13px;height:13px;border-radius:50%;
    background: conic-gradient(#4FAE7B 0 50%, #F7B23B 50% 100%); }
  .brand b { font-size: 18px; letter-spacing: -0.3px; }
  .brand b i { color: #ee9412; font-style: normal; }
  .meta { text-align: right; font-size: 12px; color: #5e6e64; }
  h1.title { font-family: Georgia, "Times New Roman", serif; font-size: 26px; margin: 22px 0 2px; color:#15241c; }
  .sub { color: #5e6e64; font-size: 13px; margin-bottom: 22px; }
  h1,h2,h3,h4 { font-family: Georgia, serif; color: #15241c; line-height: 1.25; }
  h1 { font-size: 22px; margin: 24px 0 8px; }
  h2 { font-size: 18px; margin: 22px 0 6px; }
  h3 { font-size: 15px; margin: 18px 0 4px; }
  h4 { font-size: 13px; margin: 14px 0 4px; }
  p { margin: 8px 0; font-size: 13.5px; }
  ul { margin: 8px 0; padding-left: 18px; }
  li { margin: 4px 0; font-size: 13.5px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
  th, td { border: 1px solid #e7decb; padding: 7px 10px; text-align: left; }
  th { background: #f6f1e7; font-weight: 600; }
  .foot { margin-top: 30px; border-top: 1px solid #e7decb; padding-top: 10px; font-size: 11px; color: #98a39a; display:flex; justify-content:space-between; }
  @media print { .wrap { padding: 0; } }
</style></head>
<body><div class="wrap">
  <div class="kop">
    <div class="brand"><span class="mark"><span></span></span><b>Gr<i>ow</i></b></div>
    <div class="meta">${esc(company || "")}<br/>Generated ${date}</div>
  </div>
  <h1 class="title">${esc(title)}</h1>
  ${subtitle ? `<div class="sub">${esc(subtitle)}</div>` : ""}
  <div class="body">${mdToHtml(markdown)}</div>
  <div class="foot"><span>Prepared with Grow — investor-ready business reporting</span><span>${esc(company || "")}</span></div>
</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
</body></html>`);
  w.document.close();
}
