import type { FormField } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  field: FormField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function LayoutSection({ field, stepId, parentPath }: Props) {
  const { dispatch } = useFormBuilder();

  function updateLayout(changes: Partial<FormField["layout"]>) {
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        stepId,
        fieldId: field.id,
        changes: { layout: { ...field.layout, ...changes } },
        parentPath,
      },
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground">Layout</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="field-column" className="text-xs">
            Column
          </Label>
          <Input
            id="field-column"
            type="number"
            min={1}
            value={field.layout.column}
            onChange={(e) =>
              updateLayout({ column: parseInt(e.target.value) || 1 })
            }
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="field-colspan" className="text-xs">
            Col Span
          </Label>
          <Input
            id="field-colspan"
            type="number"
            min={1}
            value={field.layout.colSpan}
            onChange={(e) =>
              updateLayout({ colSpan: parseInt(e.target.value) || 1 })
            }
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
