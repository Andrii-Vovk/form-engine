import { PlusIcon } from "lucide-react";
import type { YupAst, YupAstNode } from "@/types/form-schema";
import {
  getRulesForFieldType,
  type ValidationRuleDef,
} from "./validation-rules";
import { ValidationRuleRow } from "./ValidationRuleRow";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ValidationBuilderProps {
  fieldType: string;
  validationSchema: YupAst;
  onChange: (schema: YupAst) => void;
}

/** Find the rule def matching a yup-ast node */
function findRuleDef(
  node: YupAstNode,
  availableRules: ValidationRuleDef[]
): ValidationRuleDef | undefined {
  const method = node[0] as string;
  return availableRules.find((r) => r.yupMethod === method);
}

export function ValidationBuilder({
  fieldType,
  validationSchema,
  onChange,
}: ValidationBuilderProps) {
  const availableRules = getRulesForFieldType(fieldType);

  // First node is always the base type (yup.string, yup.number, etc.) — not editable
  const baseNode = validationSchema[0];
  const ruleNodes = validationSchema.slice(1);

  // Filter out rules already in use
  const usedMethods = new Set(ruleNodes.map((n) => n[0]));
  const addableRules = availableRules.filter(
    (r) => !usedMethods.has(r.yupMethod)
  );

  function handleAddRule(rule: ValidationRuleDef) {
    const newNode: YupAstNode = [rule.yupMethod];
    // Add default param values
    for (const param of rule.params) {
      if (param.type === "number") {
        newNode.push(param.default ?? 0);
      } else if (param.type === "string[]") {
        newNode.push(param.default ?? []);
      } else {
        newNode.push(param.default ?? "");
      }
    }
    onChange([...validationSchema, newNode]);
  }

  function handleUpdateRule(index: number, node: YupAstNode) {
    const newSchema = [...validationSchema];
    newSchema[index + 1] = node; // +1 because base node is at 0
    onChange(newSchema);
  }

  function handleRemoveRule(index: number) {
    const newSchema = [...validationSchema];
    newSchema.splice(index + 1, 1); // +1 because base node is at 0
    onChange(newSchema);
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        Base type:{" "}
        <span className="font-mono font-medium">
          {(baseNode?.[0] as string) ?? "unknown"}
        </span>
      </div>

      {ruleNodes.map((node, index) => {
        const ruleDef = findRuleDef(node, availableRules);
        if (!ruleDef) {
          // Unknown rule — show raw
          return (
            <div
              key={index}
              className="rounded-md border bg-muted/50 p-2 text-xs font-mono"
            >
              {JSON.stringify(node)}
              <button
                type="button"
                onClick={() => handleRemoveRule(index)}
                className="ml-2 text-destructive"
              >
                remove
              </button>
            </div>
          );
        }
        return (
          <ValidationRuleRow
            key={`${ruleDef.key}-${index}`}
            rule={ruleDef}
            node={node}
            onChange={(n) => handleUpdateRule(index, n)}
            onRemove={() => handleRemoveRule(index)}
          />
        );
      })}

      {addableRules.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <PlusIcon className="size-3.5" />
              Add Rule
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {addableRules.map((rule) => (
              <DropdownMenuItem
                key={rule.key}
                onClick={() => handleAddRule(rule)}
              >
                {rule.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
