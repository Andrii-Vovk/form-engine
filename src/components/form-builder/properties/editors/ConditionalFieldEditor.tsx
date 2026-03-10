import { PlusIcon, XIcon } from "lucide-react";
import type {
  ConditionalField,
  BooleanConditionalField,
  SelectConditionalField,
  FieldType,
} from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface Props {
  field: ConditionalField;
  stepId: string;
}

const ADDABLE_TYPES: { type: FieldType; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "email", label: "Email" },
  { type: "url", label: "URL" },
  { type: "maskedText", label: "Masked" },
  { type: "selectSimple", label: "Select" },
  { type: "selectObject", label: "Object Select" },
];

export function ConditionalFieldEditor({ field, stepId }: Props) {
  const { dispatch } = useFormBuilder();
  const [newBranchKey, setNewBranchKey] = useState("");

  function handleConditionTypeChange(conditionType: "boolean" | "select") {
    if (conditionType === "boolean" && field.conditionType !== "boolean") {
      dispatch({
        type: "UPDATE_FIELD",
        payload: {
          stepId,
          fieldId: field.id,
          changes: {
            conditionType: "boolean",
            defaultValue: false,
            branches: { true: [], false: [] },
            validationSchema: [["yup.boolean"]],
          } as Partial<BooleanConditionalField>,
        },
      });
    } else if (
      conditionType === "select" &&
      field.conditionType !== "select"
    ) {
      dispatch({
        type: "UPDATE_FIELD",
        payload: {
          stepId,
          fieldId: field.id,
          changes: {
            conditionType: "select",
            options: [],
            defaultValue: null,
            branches: {},
            validationSchema: [["yup.string"]],
          } as Partial<SelectConditionalField>,
        },
      });
    }
  }

  function handleAddOption() {
    if (!newBranchKey.trim()) return;
    if (field.conditionType !== "select") return;
    const key = newBranchKey.trim();
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        stepId,
        fieldId: field.id,
        changes: {
          options: [...field.options, key],
        } as Partial<SelectConditionalField>,
      },
    });
    dispatch({
      type: "ADD_BRANCH",
      payload: { stepId, fieldId: field.id, branchKey: key },
    });
    setNewBranchKey("");
  }

  function handleRemoveOption(key: string) {
    if (field.conditionType !== "select") return;
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        stepId,
        fieldId: field.id,
        changes: {
          options: field.options.filter((o) => o !== key),
        } as Partial<SelectConditionalField>,
      },
    });
    dispatch({
      type: "REMOVE_BRANCH",
      payload: { stepId, fieldId: field.id, branchKey: key },
    });
  }

  function handleAddFieldToBranch(branchKey: string, fieldType: FieldType) {
    dispatch({
      type: "ADD_BRANCH_FIELD",
      payload: {
        stepId,
        conditionalFieldId: field.id,
        branchKey,
        fieldType,
      },
    });
  }

  const branchEntries = Object.entries(field.branches);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground">
        Conditional
      </h4>

      <div className="space-y-1.5">
        <Label className="text-xs">Condition Type</Label>
        <Select
          value={field.conditionType}
          onValueChange={(v) =>
            handleConditionTypeChange(v as "boolean" | "select")
          }
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
            <SelectItem value="select">Select (Multiple options)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {field.conditionType === "select" && (
        <div className="space-y-2">
          <Label className="text-xs">Options</Label>
          <div className="flex gap-1.5 flex-wrap">
            {field.options.map((opt) => (
              <Badge key={opt} variant="secondary" className="gap-1">
                {opt}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(opt)}
                  className="hover:text-destructive"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Input
              value={newBranchKey}
              onChange={(e) => setNewBranchKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
              placeholder="New option..."
              className="h-8 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              disabled={!newBranchKey.trim()}
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Branches</Label>
        {branchEntries.map(([key, branchFields]) => (
          <div key={key} className="rounded-md border p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{key}</span>
              <Badge variant="outline" className="text-[10px]">
                {branchFields.length} field(s)
              </Badge>
            </div>
            {branchFields.map((bf) => (
              <div
                key={bf.id}
                className="flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-xs cursor-pointer hover:bg-muted"
                onClick={() =>
                  dispatch({
                    type: "SELECT_FIELD",
                    payload: {
                      fieldId: bf.id,
                      parentPath: {
                        parentFieldId: field.id,
                        branchKey: key,
                      },
                    },
                  })
                }
              >
                <span>
                  {bf.label}{" "}
                  <span className="text-muted-foreground">({bf.type})</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: "REMOVE_NESTED_FIELD",
                      payload: {
                        stepId,
                        parentFieldId: field.id,
                        fieldId: bf.id,
                        branchKey: key,
                      },
                    });
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-full text-xs">
                  <PlusIcon className="size-3" />
                  Add Field
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {ADDABLE_TYPES.map((t) => (
                  <DropdownMenuItem
                    key={t.type}
                    onClick={() => handleAddFieldToBranch(key, t.type)}
                  >
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
