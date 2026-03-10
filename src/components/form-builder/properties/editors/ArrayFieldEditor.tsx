import { PlusIcon, XIcon } from "lucide-react";
import type { ArrayField, FieldType } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  field: ArrayField;
  stepId: string;
}

const CHILD_TYPES: { type: FieldType; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "email", label: "Email" },
  { type: "url", label: "URL" },
  { type: "maskedText", label: "Masked" },
  { type: "selectSimple", label: "Select" },
  { type: "selectObject", label: "Object Select" },
];

export function ArrayFieldEditor({ field, stepId }: Props) {
  const { dispatch } = useFormBuilder();

  function updateConfig(changes: Partial<ArrayField["arrayConfig"]>) {
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        stepId,
        fieldId: field.id,
        changes: { arrayConfig: { ...field.arrayConfig, ...changes } },
      },
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground">
        Array Config
      </h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Add Button Label</Label>
        <Input
          value={field.arrayConfig.addButtonLabel}
          onChange={(e) => updateConfig({ addButtonLabel: e.target.value })}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Remove Button Label</Label>
        <Input
          value={field.arrayConfig.removeButtonLabel ?? "Remove"}
          onChange={(e) =>
            updateConfig({ removeButtonLabel: e.target.value || undefined })
          }
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Child Fields</Label>
        {field.fields.map((child) => (
          <div
            key={child.id}
            className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-xs cursor-pointer hover:bg-muted"
            onClick={() =>
              dispatch({
                type: "SELECT_FIELD",
                payload: {
                  fieldId: child.id,
                  parentPath: { parentFieldId: field.id },
                },
              })
            }
          >
            <span>
              {child.label}{" "}
              <span className="text-muted-foreground">({child.type})</span>
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
                    fieldId: child.id,
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
            <Button variant="outline" size="sm" className="w-full">
              <PlusIcon className="size-3.5" />
              Add Child Field
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {CHILD_TYPES.map((t) => (
              <DropdownMenuItem
                key={t.type}
                onClick={() =>
                  dispatch({
                    type: "ADD_ARRAY_CHILD_FIELD",
                    payload: {
                      stepId,
                      arrayFieldId: field.id,
                      fieldType: t.type,
                    },
                  })
                }
              >
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
