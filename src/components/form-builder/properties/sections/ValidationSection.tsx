import type { FormField } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { ValidationBuilder } from "../../validation/ValidationBuilder";

interface Props {
  field: FormField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function ValidationSection({ field, stepId, parentPath }: Props) {
  const { dispatch } = useFormBuilder();

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground">
        Validation
      </h4>
      <ValidationBuilder
        fieldType={field.type}
        validationSchema={field.validationSchema}
        onChange={(validationSchema) =>
          dispatch({
            type: "UPDATE_FIELD",
            payload: {
              stepId,
              fieldId: field.id,
              changes: { validationSchema },
              parentPath,
            },
          })
        }
      />
    </div>
  );
}
