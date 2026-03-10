import { useState, useRef } from "react";
import { DownloadIcon, UploadIcon, EyeIcon } from "lucide-react";
import { useFormBuilder } from "../FormBuilderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JsonPreview } from "../preview/JsonPreview";
import { toast } from "sonner";

export function BuilderToolbar() {
  const { state, dispatch } = useFormBuilder();
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = JSON.stringify(state.schema, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.schema.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Schema exported");
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const schema = JSON.parse(event.target?.result as string);
        if (!schema.id || !schema.steps || !Array.isArray(schema.steps)) {
          toast.error("Invalid schema: missing required fields");
          return;
        }
        dispatch({ type: "SET_SCHEMA", payload: schema });
        toast.success("Schema imported");
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    // Reset input so re-importing same file works
    e.target.value = "";
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b bg-background px-4 py-2">
        <Input
          value={state.schema.title}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_SCHEMA_META",
              payload: { title: e.target.value },
            })
          }
          className="h-8 max-w-xs text-sm font-semibold border-none shadow-none focus-visible:ring-1"
        />
        <div className="flex-1" />
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon className="size-4" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
          <EyeIcon className="size-4" />
          Preview
        </Button>
        <Button size="sm" onClick={handleExport}>
          <DownloadIcon className="size-4" />
          Export
        </Button>
      </div>
      <JsonPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        schema={state.schema}
      />
    </>
  );
}
