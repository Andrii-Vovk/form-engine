import { XIcon } from "lucide-react";
import type { ValidationRuleDef } from "./validation-rules";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { YupAstNode } from "@/types/form-schema";

interface ValidationRuleRowProps {
  rule: ValidationRuleDef;
  node: YupAstNode;
  onChange: (node: YupAstNode) => void;
  onRemove: () => void;
}

export function ValidationRuleRow({
  rule,
  node,
  onChange,
  onRemove,
}: ValidationRuleRowProps) {
  function handleParamChange(paramIndex: number, value: unknown) {
    const newNode = [...node] as YupAstNode;
    // params start at index 1 (index 0 is the method name)
    newNode[paramIndex + 1] = value;
    onChange(newNode);
  }

  return (
    <div className="flex items-start gap-2 rounded-md border bg-muted/50 p-2">
      <div className="flex-1 space-y-1.5">
        <div className="text-xs font-medium">{rule.label}</div>
        {rule.params.map((param, i) => (
          <div key={param.name} className="space-y-0.5">
            <Label className="text-[10px] text-muted-foreground">
              {param.label}
            </Label>
            {param.type === "number" ? (
              <Input
                type="number"
                value={(node[i + 1] as number) ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : Number(e.target.value);
                  handleParamChange(i, val);
                }}
                className="h-7 text-xs"
              />
            ) : param.type === "string[]" ? (
              <Input
                value={
                  Array.isArray(node[i + 1])
                    ? (node[i + 1] as string[]).join(", ")
                    : ""
                }
                onChange={(e) =>
                  handleParamChange(
                    i,
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="val1, val2, val3"
                className="h-7 text-xs"
              />
            ) : (
              <Input
                value={(node[i + 1] as string) ?? ""}
                onChange={(e) => handleParamChange(i, e.target.value || undefined)}
                className="h-7 text-xs"
              />
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <XIcon className="size-3" />
      </button>
    </div>
  );
}
