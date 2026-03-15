"use client";

/**
 * Safe markdown renderer — no dangerouslySetInnerHTML.
 * Handles: **bold**, ## headings, - lists, \n newlines
 */
export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-semibold mt-2 mb-1">
          {renderInline(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold mt-3 mb-1">
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex gap-1.5 ml-1">
          <span className="text-gray-500 shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <span key={i}>
          {renderInline(line)}
          {i < lines.length - 1 && lines[i + 1]?.trim() !== "" && <br />}
        </span>
      );
    }
  }

  return <div className="text-sm leading-relaxed">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Split on **bold** markers
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
