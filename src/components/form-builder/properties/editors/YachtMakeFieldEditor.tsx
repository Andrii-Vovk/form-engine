import type { YachtMakeField } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Props {
  field: YachtMakeField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function YachtMakeFieldEditor({ field, stepId, parentPath }: Props) {
  const { dispatch } = useFormBuilder();

  function update(changes: Partial<YachtMakeField>) {
    dispatch({
      type: "UPDATE_FIELD",
      payload: { stepId, fieldId: field.id, changes, parentPath },
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground">
        Make Config
      </h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Sets Field</Label>
        <Input
          value={field.setsField}
          onChange={(e) => update({ setsField: e.target.value })}
          className="h-8 text-sm font-mono"
          placeholder="makeName"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show All Brands</Label>
        <Switch
          checked={field.config?.showAllBrands ?? false}
          onCheckedChange={(checked) =>
            update({ config: { ...field.config, showAllBrands: checked } })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Search Term as Option</Label>
        <Switch
          checked={field.config?.searchTermAsOption ?? false}
          onCheckedChange={(checked) =>
            update({ config: { ...field.config, searchTermAsOption: checked } })
          }
        />
      </div>
    </div>
  );
}
