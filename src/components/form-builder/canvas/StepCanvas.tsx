import { useDroppable } from "@dnd-kit/react";
import { useDragOperation } from "@dnd-kit/react";
import type { FormStep } from "@/types/form-schema";
import { CanvasField } from "./CanvasField";
import { EmptyStepPlaceholder } from "./EmptyStepPlaceholder";
import { DropIndicator } from "./DropIndicator";
import { cn } from "@/lib/utils";

interface StepCanvasProps {
  step: FormStep;
}

export function StepCanvas({ step }: StepCanvasProps) {
  const { ref, isDropTarget } = useDroppable({
    id: `canvas-${step.id}`,
    accept: ["palette-field", "canvas-field"],
    data: { stepId: step.id },
  });

  const { source: dragSource } = useDragOperation();
  const dragSourceData = dragSource?.data as Record<string, unknown> | undefined;
  const isPaletteDragOverCanvas =
    isDropTarget && dragSourceData?.source === "palette";

  if (step.fields.length === 0) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg transition-colors",
          isDropTarget && "ring-2 ring-primary/30"
        )}
      >
        <EmptyStepPlaceholder />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-2 gap-4",
        isDropTarget && "ring-2 ring-primary/30 rounded-lg"
      )}
    >
      {step.fields.map((field, index) => (
        <CanvasField
          key={field.id}
          field={field}
          index={index}
          stepId={step.id}
        />
      ))}
      {/* Show indicator at end of list when hovering over canvas container */}
      {isPaletteDragOverCanvas && (
        <div className="relative col-span-2">
          <DropIndicator visible />
        </div>
      )}
    </div>
  );
}
