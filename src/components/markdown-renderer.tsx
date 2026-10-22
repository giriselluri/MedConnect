'use client';

import React from 'react';

interface MarkdownRendererProps {
  content?: string;
  className?: string;
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, and [link](url)
 */
function parseInline(text: string): React.ReactNode[] {
  // Regex to match inline patterns
  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold + Italic: ***text***
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      return (
        <strong key={index} className="font-bold italic text-slate-900">
          {part.slice(3, -3)}
        </strong>
      );
    }

    // Bold: **text** or __text__
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
    ) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text* or _text_
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      return (
        <em key={index} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 text-teal-800 font-mono text-[11px] sm:text-xs font-semibold border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 hover:text-teal-900 underline font-semibold transition"
        >
          {label}
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Structured Markdown Parser & Renderer for Clinical and Educational Content
 */
export function MarkdownRenderer({ content = '', className = '' }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return <div className="text-xs text-slate-400 italic py-2">No content provided.</div>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal Rule: --- or ***
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      elements.push(<hr key={`hr-${i}`} className="my-6 border-slate-200" />);
      i++;
      continue;
    }

    // Code Block: ```...```
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      elements.push(
        <pre
          key={`codeblock-${i}`}
          className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-3 border border-slate-800 leading-relaxed"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Table: | col1 | col2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableRows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableRows.push(lines[i].trim());
        i++;
      }

      if (tableRows.length >= 2) {
        const headerCells = tableRows[0]
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        const bodyRows = tableRows.slice(2).map((row) =>
          row
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim())
        );

        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-xl border border-slate-200">
            <table className="min-w-full text-xs text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2.5">
                      {parseInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {bodyRows.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    {r.map((c, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-slate-700">
                        {parseInline(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 mt-5 mb-2"
        >
          {parseInline(trimmed.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-sm sm:text-base font-bold text-teal-900 bg-teal-50/80 border-l-4 border-teal-600 px-3.5 py-2 rounded-r-xl mt-6 mb-3 shadow-2xs flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0" />
          <span>{parseInline(trimmed.slice(4))}</span>
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-base sm:text-lg font-extrabold text-slate-900 mt-6 mb-3 pb-1 border-b border-slate-100"
        >
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-lg sm:text-xl font-extrabold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200"
        >
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquote: > text
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-amber-500 bg-amber-50/60 p-3.5 rounded-r-xl text-slate-800 italic my-3 text-xs sm:text-sm leading-relaxed"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx}>{parseInline(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Unordered List: - item or * item
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-3 pl-1">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
            >
              <span className="text-teal-600 font-bold text-sm leading-none mt-1 select-none flex-shrink-0">
                •
              </span>
              <span className="flex-1">{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const match = lines[i].trim().match(/^(\d+)\.\s+(.*)$/);
        if (match) {
          listItems.push({ num: match[1], text: match[2] });
        }
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-3 pl-1">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold mt-0.5 flex-shrink-0 select-none">
                {item.num}
              </span>
              <span className="flex-1 pt-0.5">{parseInline(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Default: Paragraph text
    elements.push(
      <p
        key={`p-${i}`}
        className="my-2.5 text-slate-700 text-xs sm:text-sm leading-relaxed"
      >
        {parseInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className={`markdown-content space-y-1 ${className}`}>{elements}</div>;
}
