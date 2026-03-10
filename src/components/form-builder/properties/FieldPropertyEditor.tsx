import type { FormField } from "@/types/form-schema";
import { BasePropertiesSection } from "./sections/BasePropertiesSection";
import { LayoutSection } from "./sections/LayoutSection";
import { DataMappingSection } from "./sections/DataMappingSection";
import { ValidationSection } from "./sections/ValidationSection";
import { MaskedTextFieldEditor } from "./editors/MaskedTextFieldEditor";
import { SelectSimpleFieldEditor } from "./editors/SelectSimpleFieldEditor";
import { SelectObjectFieldEditor } from "./editors/SelectObjectFieldEditor";
import { YachtMakeFieldEditor } from "./editors/YachtMakeFieldEditor";
import { YachtModelFieldEditor } from "./editors/YachtModelFieldEditor";
import { ArrayFieldEditor } from "./editors/ArrayFieldEditor";
import { ConditionalFieldEditor } from "./editors/ConditionalFieldEditor";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface FieldPropertyEditorProps {
  field: FormField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function FieldPropertyEditor({
  field,
  stepId,
  parentPath,
}: FieldPropertyEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">Field Properties</h3>
        <Badge variant="outline" className="text-[10px]">
          {field.type}
        </Badge>
      </div>

      <BasePropertiesSection
        field={field}
        stepId={stepId}
        parentPath={parentPath}
      />

      <Separator />

      {/* Type-specific editors */}
      {field.type === "maskedText" && (
        <>
          <MaskedTextFieldEditor
            field={field}
            stepId={stepId}
            parentPath={parentPath}
          />
          <Separator />
        </>
      )}
      {field.type === "selectSimple" && (
        <>
          <SelectSimpleFieldEditor
            field={field}
            stepId={stepId}
            parentPath={parentPath}
          />
          <Separator />
        </>
      )}
      {field.type === "selectObject" && (
        <>
          <SelectObjectFieldEditor
            field={field}
            stepId={stepId}
            parentPath={parentPath}
          />
          <Separator />
        </>
      )}
      {field.type === "yachtMake" && (
        <>
          <YachtMakeFieldEditor
            field={field}
            stepId={stepId}
            parentPath={parentPath}
          />
          <Separator />
        </>
      )}
      {field.type === "yachtModel" && (
        <>
          <YachtModelFieldEditor
            field={field}
            stepId={stepId}
            parentPath={parentPath}
          />
          <Separator />
        </>
      )}
      {field.type === "array" && (
        <>
          <ArrayFieldEditor field={field} stepId={stepId} />
          <Separator />
        </>
      )}
      {field.type === "conditional" && (
        <>
          <ConditionalFieldEditor field={field} stepId={stepId} />
          <Separator />
        </>
      )}

      <LayoutSection
        field={field}
        stepId={stepId}
        parentPath={parentPath}
      />

      <Separator />

      <DataMappingSection
        field={field}
        stepId={stepId}
        parentPath={parentPath}
      />

      <Separator />

      <ValidationSection
        field={field}
        stepId={stepId}
        parentPath={parentPath}
      />
    </div>
  );
}
