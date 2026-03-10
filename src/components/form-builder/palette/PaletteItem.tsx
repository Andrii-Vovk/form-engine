import { useDraggable } from "@dnd-kit/react";
import { useId, type ReactNode } from "react";
import type { FieldType } from "@/types/form-schema";
import { cn } from "@/lib/utils";

interface PaletteItemProps {
  fieldType: FieldType;
  label: string;
  icon: ReactNode;
}

export function PaletteItem({ fieldType, label, icon }: PaletteItemProps) {
  const id = useId();

  const { ref, isDragging } = useDraggable({
    id: `palette-${fieldType}-${id}`,
    type: "palette-field",
    data: { source: "palette", fieldType },
  });

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center gap-1 rounded-md border border-border bg-card p-2 text-xs hover:border-primary hover:bg-accent transition-colors cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="truncate text-[10px] font-medium">{label}</span>
    </div>
  );
}
