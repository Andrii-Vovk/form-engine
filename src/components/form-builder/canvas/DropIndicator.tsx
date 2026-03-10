import { cn } from "@/lib/utils";

interface DropIndicatorProps {
  visible: boolean;
}

export function DropIndicator({ visible }: DropIndicatorProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -top-2.5 left-0 right-0 z-10 flex items-center transition-opacity",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="size-2 rounded-full bg-primary" />
      <div className="h-0.5 flex-1 bg-primary" />
      <div className="size-2 rounded-full bg-primary" />
    </div>
  );
}
