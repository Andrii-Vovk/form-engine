import { useState, type ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaletteGroupProps {
  label: string;
  children: ReactNode;
}

export function PaletteGroup({ label, children }: PaletteGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
      >
        {label}
        <ChevronDownIcon
          className={cn("size-3.5 transition-transform", !open && "-rotate-90")}
        />
      </button>
      {open && <div className="mt-1 grid grid-cols-2 gap-1.5">{children}</div>}
    </div>
  );
}
