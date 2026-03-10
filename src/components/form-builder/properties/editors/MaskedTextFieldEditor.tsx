import type { MaskedTextField } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  field: MaskedTextField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function MaskedTextFieldEditor({ field, stepId, parentPath }: Props) {
  const { dispatch } = useFormBuilder();

  function updateMask(changes: Partial<MaskedTextField["mask"]>) {
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        stepId,
        fieldId: field.id,
        changes: { mask: { ...field.mask, ...changes } },
        parentPath,
      },
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground">Mask</h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Format</Label>
        <Input
          value={field.mask.format}
          onChange={(e) => updateMask({ format: e.target.value })}
          className="h-8 text-sm font-mono"
          placeholder="+1 (###) ###-####"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Mask Char</Label>
          <Input
            value={field.mask.mask ?? "_"}
            onChange={(e) => updateMask({ mask: e.target.value })}
            className="h-8 text-sm font-mono"
            maxLength={1}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Pattern Char</Label>
          <Input
            value={field.mask.patternChar ?? "#"}
            onChange={(e) => updateMask({ patternChar: e.target.value })}
            className="h-8 text-sm font-mono"
            maxLength={1}
          />
        </div>
      </div>
    </div>
  );
}
