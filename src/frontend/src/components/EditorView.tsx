import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Code2, Maximize2, MonitorPlay, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My HTML Sandbox</title>
  <style>
    body {
      font-family: sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1f2937;
      line-height: 1.6;
    }
    h1 { color: #1e88ff; margin-bottom: 8px; }
    h2 { color: #374151; }
    .card {
      background: #f3f6fa;
      border-radius: 10px;
      padding: 16px;
      margin: 16px 0;
    }
    ul { padding-left: 20px; }
    li { margin: 4px 0; }
    a { color: #1e88ff; }
  </style>
</head>
<body>
  <h1>HTML Sandbox ✏️</h1>
  <p>Welcome to your free HTML editor! Edit this code and watch it update live.</p>

  <div class="card">
    <h2>Things to try:</h2>
    <ul>
      <li>Add a new <strong>heading</strong> with &lt;h2&gt;</li>
      <li>Create a <em>paragraph</em> with &lt;p&gt;</li>
      <li>Add an <a href="#">anchor link</a> with &lt;a href=""&gt;</li>
      <li>Insert an image with &lt;img src="" alt=""&gt;</li>
      <li>Build a <strong>table</strong> with &lt;table&gt;</li>
    </ul>
  </div>

  <p>Happy coding! 🚀</p>
</body>
</html>`;

export default function EditorView() {
  const [editorCode, setEditorCode] = useState(STARTER_HTML);
  const [previewCode, setPreviewCode] = useState(STARTER_HTML);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setPreviewCode(editorCode), 300);
    return () => clearTimeout(timer);
  }, [editorCode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = editorRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newVal = `${editorCode.substring(0, start)}  ${editorCode.substring(end)}`;
      setEditorCode(newVal);
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = start + 2;
          editorRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 p-8 space-y-4 max-w-6xl"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">HTML Sandbox</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Free-form HTML editor — experiment with code and see live results.
        </p>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-2 gap-4">
        {/* Editor */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                HTML Editor
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-chart-4/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
            </div>
          </div>
          <textarea
            ref={editorRef}
            data-ocid="editor.editor"
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className={cn(
              "code-editor w-full resize-none outline-none",
              "bg-editor-bg text-editor-fg text-sm leading-relaxed p-4",
            )}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              height: "calc(100vh - 280px)",
              minHeight: "400px",
            }}
          />
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/30">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditorCode(STARTER_HTML)}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset to Starter
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <MonitorPlay className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live Preview
              </span>
            </div>
            <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="flex-1 bg-white">
            <iframe
              title="Sandbox Preview"
              srcDoc={previewCode}
              sandbox="allow-scripts"
              className="w-full border-0"
              style={{
                height: "calc(100vh - 280px)",
                minHeight: "400px",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
