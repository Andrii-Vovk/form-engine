import { TrashIcon, GripVerticalIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useDragOperation } from "@dnd-kit/react";
import type { FormField } from "@/types/form-schema";
import { useFormBuilder } from "../FormBuilderContext";
import { Badge } from "@/components/ui/badge";
import { BranchDropZone } from "./BranchDropZone";
import { ArrayDropZone } from "./ArrayDropZone";
import { DropIndicator } from "./DropIndicator";
import { cn } from "@/lib/utils";

interface CanvasFieldProps {
  field: FormField;
  index: number;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
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

export function CanvasField({ field, index, stepId, parentPath }: CanvasFieldProps) {
  const { state, dispatch } = useFormBuilder();
  const isSelected = state.selection?.fieldId === field.id;

  const { ref, isDragging, isDropTarget, handleRef } = useSortable({
    id: field.id,
    index,
    group: stepId,
    type: "canvas-field",
    accept: ["canvas-field", "palette-field"],
    data: { source: "canvas", fieldId: field.id, stepId },
  });

  const { source: dragSource } = useDragOperation();
  const dragSourceData = dragSource?.data as Record<string, unknown> | undefined;
  const isPaletteDrop = isDropTarget && dragSourceData?.source === "palette";

  function handleSelect() {
    dispatch({
      type: "SELECT_FIELD",
      payload: { fieldId: field.id, parentPath },
    });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (parentPath) {
      dispatch({
        type: "REMOVE_NESTED_FIELD",
        payload: {
          stepId,
          parentFieldId: parentPath.parentFieldId,
          fieldId: field.id,
          branchKey: parentPath.branchKey,
        },
      });
    } else {
      dispatch({
        type: "REMOVE_FIELD",
        payload: { stepId, fieldId: field.id },
      });
    }
  }

  return (
    <div
      ref={ref}
      onClick={handleSelect}
      className={cn(
        "group relative cursor-pointer rounded-lg border bg-card p-3 transition-all hover:border-primary/50",
        isSelected && "border-primary ring-2 ring-primary/20",
        isDragging && "opacity-50"
      )}
      style={{
        gridColumn: `${field.layout.column} / span ${field.layout.colSpan}`,
      }}
    >
      <DropIndicator visible={isPaletteDrop} />
      <div className="flex items-start justify-between gap-2">
        <div
          ref={handleRef}
          className="shrink-0 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground"
        >
          <GripVerticalIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{field.label}</span>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {typeLabels[field.type] || field.type}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {field.name}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 transition-opacity"
        >
          <TrashIcon className="size-3.5" />
        </button>
      </div>

      {/* Conditional: droppable branch sections */}
      {field.type === "conditional" && (
        <div className="mt-2 space-y-2 border-t pt-2">
          {Object.entries(field.branches).map(([key, branchFields]) => (
            <BranchDropZone
              key={key}
              branchKey={key}
              fields={branchFields}
              conditionalFieldId={field.id}
              stepId={stepId}
            />
          ))}
        </div>
      )}
      {/* Array: droppable child fields section */}
      {field.type === "array" && (
        <div className="mt-2 border-t pt-2">
          <ArrayDropZone
            fields={field.fields}
            arrayFieldId={field.id}
            stepId={stepId}
          />
        </div>
      )}
    </div>
  );
}
