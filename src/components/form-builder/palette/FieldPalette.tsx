import {
  TypeIcon,
  HashIcon,
  MailIcon,
  LinkIcon,
  TextCursorInputIcon,
  SquareChevronDownIcon,
  BoxIcon,
  AnchorIcon,
  ShipIcon,
  GitBranchIcon,
  ListIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaletteGroup } from "./PaletteGroup";
import { PaletteItem } from "./PaletteItem";

const iconClass = "size-4";

export function FieldPalette() {
  return (
    <ScrollArea className="h-full">
      <div className="p-3">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Fields
        </h2>
        <div className="space-y-2">
          <PaletteGroup label="Basic">
            <PaletteItem fieldType="text" label="Text" icon={<TypeIcon className={iconClass} />} />
            <PaletteItem fieldType="number" label="Number" icon={<HashIcon className={iconClass} />} />
            <PaletteItem fieldType="email" label="Email" icon={<MailIcon className={iconClass} />} />
            <PaletteItem fieldType="url" label="URL" icon={<LinkIcon className={iconClass} />} />
            <PaletteItem fieldType="maskedText" label="Masked" icon={<TextCursorInputIcon className={iconClass} />} />
          </PaletteGroup>
          <PaletteGroup label="Selection">
            <PaletteItem fieldType="selectSimple" label="Select" icon={<SquareChevronDownIcon className={iconClass} />} />
            <PaletteItem fieldType="selectObject" label="Object Select" icon={<BoxIcon className={iconClass} />} />
            <PaletteItem fieldType="yachtMake" label="Make" icon={<AnchorIcon className={iconClass} />} />
            <PaletteItem fieldType="yachtModel" label="Model" icon={<ShipIcon className={iconClass} />} />
          </PaletteGroup>
          <PaletteGroup label="Advanced">
            <PaletteItem fieldType="conditional" label="Conditional" icon={<GitBranchIcon className={iconClass} />} />
            <PaletteItem fieldType="array" label="Array" icon={<ListIcon className={iconClass} />} />
          </PaletteGroup>
        </div>
      </div>
    </ScrollArea>
  );
}
