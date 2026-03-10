import { CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import type { FormSchema } from "@/types/form-schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JsonPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: FormSchema;
}

export function JsonPreview({ open, onOpenChange, schema }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(schema, null, 2);

  async function handleCopy() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>JSON Schema Preview</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <pre className="rounded-md bg-muted p-4 text-xs font-mono overflow-auto whitespace-pre-wrap">
            {json}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
