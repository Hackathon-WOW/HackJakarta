"use client";

import { Download, FileDown, Sparkles } from "lucide-react";
import { Markdown } from "./Markdown";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { openPrintableDocument, downloadMarkdown } from "@/lib/doc-export";

export function DocumentViewer({ doc, company }) {
  if (!doc) return null;
  const md = doc.generatedContent?.markdown || "";
  const ai = doc.generatedContent?.aiGenerated;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Badge variant={ai ? "amber" : "sand"}>
          {ai ? (
            <>
              <Sparkles className="h-3 w-3" /> AI-generated
            </>
          ) : (
            "Sample"
          )}
        </Badge>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => downloadMarkdown(`${doc.title}.md`, md)}>
            <FileDown className="h-4 w-4" /> .md
          </Button>
          <Button
            size="sm"
            variant="amber"
            onClick={() => openPrintableDocument({ title: doc.title, company, markdown: md })}
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* paper-styled document preview */}
      <div className="max-h-[60vh] overflow-auto rounded-2xl border border-sand bg-white p-7 shadow-inner">
        {md ? <Markdown content={md} /> : <p className="text-sm text-ink-muted">No content.</p>}
      </div>
    </div>
  );
}
