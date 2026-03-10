import type { YachtModelField } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Props {
  field: YachtModelField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function YachtModelFieldEditor({ field, stepId, parentPath }: Props) {
  const { dispatch } = useFormBuilder();

  function update(changes: Partial<YachtModelField>) {
    dispatch({
      type: "UPDATE_FIELD",
      payload: { stepId, fieldId: field.id, changes, parentPath },
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground">
        Model Config
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Make Field Name</Label>
          <Input
            value={field.dependsOn.makeFieldName}
            onChange={(e) =>
              update({
                dependsOn: {
                  ...field.dependsOn,
                  makeFieldName: e.target.value,
                },
              })
            }
            className="h-8 text-sm font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Make Name Field</Label>
          <Input
            value={field.dependsOn.makeNameFieldName}
            onChange={(e) =>
              update({
                dependsOn: {
                  ...field.dependsOn,
                  makeNameFieldName: e.target.value,
                },
              })
            }
            className="h-8 text-sm font-mono"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Sets Field</Label>
        <Input
          value={field.setsField ?? ""}
          onChange={(e) => update({ setsField: e.target.value || undefined })}
          className="h-8 text-sm font-mono"
          placeholder="modelName"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show All Models</Label>
        <Switch
          checked={field.config?.showAllModels ?? false}
          onCheckedChange={(checked) =>
            update({ config: { ...field.config, showAllModels: checked } })
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
      <div className="flex items-center justify-between">
        <Label className="text-xs">Create Disabled</Label>
        <Switch
          checked={field.config?.createDisabled ?? false}
          onCheckedChange={(checked) =>
            update({ config: { ...field.config, createDisabled: checked } })
          }
        />
      </div>
    </div>
  );
}
