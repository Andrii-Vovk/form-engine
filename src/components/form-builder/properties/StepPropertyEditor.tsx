import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormStep } from "@/types/form-schema";
import { useFormBuilder } from "../FormBuilderContext";

interface StepPropertyEditorProps {
  step: FormStep;
}

export function StepPropertyEditor({ step }: StepPropertyEditorProps) {
  const { dispatch } = useFormBuilder();

  function update(changes: Partial<Pick<FormStep, "name" | "title" | "description">>) {
    dispatch({
      type: "UPDATE_STEP",
      payload: { stepId: step.id, changes },
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Step Properties</h3>

      <div className="space-y-1.5">
        <Label htmlFor="step-name">Name</Label>
        <Input
          id="step-name"
          value={step.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="step_name"
        />
        <p className="text-[11px] text-muted-foreground">
          Machine-readable identifier
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="step-title">Title</Label>
        <Input
          id="step-title"
          value={step.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Step Title"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="step-description">Description</Label>
        <Textarea
          id="step-description"
          value={step.description ?? ""}
          onChange={(e) =>
            update({ description: e.target.value || undefined })
          }
          placeholder="Optional step description"
          rows={3}
        />
      </div>
    </div>
  );
}
