import type { FormField } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  field: FormField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function DataMappingSection({ field, stepId, parentPath }: Props) {
  const { dispatch } = useFormBuilder();

  function updateMapping(changes: Partial<FormField["dataMapping"]>) {
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        stepId,
        fieldId: field.id,
        changes: { dataMapping: { ...field.dataMapping, ...changes } },
        parentPath,
      },
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground">
        Data Mapping
      </h4>
      <div className="space-y-1.5">
        <Label htmlFor="field-prefill" className="text-xs">
          Prefill Path
        </Label>
        <Input
          id="field-prefill"
          value={field.dataMapping.prefillPath}
          onChange={(e) => updateMapping({ prefillPath: e.target.value })}
          className="h-8 text-sm font-mono"
          placeholder="e.g. buyer.firstName"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="field-submit" className="text-xs">
          Submit Path
        </Label>
        <Input
          id="field-submit"
          value={field.dataMapping.submitPath}
          onChange={(e) => updateMapping({ submitPath: e.target.value })}
          className="h-8 text-sm font-mono"
          placeholder="e.g. buyer.firstName"
        />
      </div>
    </div>
  );
}
