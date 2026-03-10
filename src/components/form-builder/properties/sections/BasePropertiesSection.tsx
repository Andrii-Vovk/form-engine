import type { FormField } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Props {
  field: FormField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function BasePropertiesSection({ field, stepId, parentPath }: Props) {
  const { dispatch } = useFormBuilder();

  function update(changes: Partial<FormField>) {
    dispatch({
      type: "UPDATE_FIELD",
      payload: { stepId, fieldId: field.id, changes, parentPath },
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="field-name" className="text-xs">
          Name
        </Label>
        <Input
          id="field-name"
          value={field.name}
          onChange={(e) => update({ name: e.target.value })}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="field-label" className="text-xs">
          Label
        </Label>
        <Input
          id="field-label"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="field-placeholder" className="text-xs">
          Placeholder
        </Label>
        <Input
          id="field-placeholder"
          value={field.placeholder ?? ""}
          onChange={(e) => update({ placeholder: e.target.value || undefined })}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="field-tooltip" className="text-xs">
          Tooltip
        </Label>
        <Input
          id="field-tooltip"
          value={field.tooltip ?? ""}
          onChange={(e) => update({ tooltip: e.target.value || undefined })}
          className="h-8 text-sm"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="field-disabled" className="text-xs">
          Disabled
        </Label>
        <Switch
          id="field-disabled"
          checked={field.disabled ?? false}
          onCheckedChange={(checked) => update({ disabled: checked })}
        />
      </div>
    </div>
  );
}
