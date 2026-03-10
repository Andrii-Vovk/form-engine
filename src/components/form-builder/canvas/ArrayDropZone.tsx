import { useDroppable } from "@dnd-kit/react";
import { TrashIcon } from "lucide-react";
import type { FormField } from "@/types/form-schema";
import { useFormBuilder } from "../FormBuilderContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ArrayDropZoneProps {
  fields: FormField[];
  arrayFieldId: string;
  stepId: string;
}

const typeLabels: Record<string, string> = {
  text: "Text",
  maskedText: "Masked",
  number: "Number",
  email: "Email",
  url: "URL",
  selectSimple: "Select",
  selectObject: "Object Select",
  yachtMake: "Make",
  yachtModel: "Model",
  array: "Array",
  conditional: "Conditional",
};

export function ArrayDropZone({
  fields,
  arrayFieldId,
  stepId,
}: ArrayDropZoneProps) {
  const { dispatch } = useFormBuilder();

  const { ref, isDropTarget } = useDroppable({
    id: `array-${arrayFieldId}`,
    accept: "palette-field",
    data: {
      source: "array",
      arrayFieldId,
      stepId,
    },
  });

  return (
    <div className="space-y-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Child Fields
      </span>
      <div
        ref={ref}
        className={cn(
          "min-h-[40px] rounded-md border border-dashed p-1.5 transition-colors space-y-1",
          isDropTarget
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        )}
      >
        {fields.length === 0 ? (
          <p className="py-1 text-center text-[10px] text-muted-foreground">
            Drop fields here
          </p>
        ) : (
          fields.map((child) => (
            <div
              key={child.id}
              className="group/nested flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-xs cursor-pointer hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({
                  type: "SELECT_FIELD",
                  payload: {
                    fieldId: child.id,
                    parentPath: { parentFieldId: arrayFieldId },
                  },
                });
              }}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="truncate">{child.label}</span>
                <Badge variant="outline" className="shrink-0 text-[9px] px-1 py-0">
                  {typeLabels[child.type] || child.type}
                </Badge>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({
                    type: "REMOVE_NESTED_FIELD",
                    payload: {
                      stepId,
                      parentFieldId: arrayFieldId,
                      fieldId: child.id,
                    },
                  });
                }}
                className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:text-destructive group-hover/nested:opacity-100 transition-opacity"
              >
                <TrashIcon className="size-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
