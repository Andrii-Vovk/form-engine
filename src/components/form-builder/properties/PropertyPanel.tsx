import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormBuilder } from "../FormBuilderContext";
import { FieldPropertyEditor } from "./FieldPropertyEditor";
import { StepPropertyEditor } from "./StepPropertyEditor";

export function PropertyPanel() {
  const { selectedField, activeStep, state } = useFormBuilder();

  if (selectedField && state.activeStepId) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <FieldPropertyEditor
            field={selectedField}
            stepId={state.activeStepId}
            parentPath={state.selection?.parentPath}
          />
        </div>
      </ScrollArea>
    );
  }

  if (activeStep) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <StepPropertyEditor step={activeStep} />
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <p className="text-sm text-muted-foreground">
        Add a step to get started
      </p>
    </div>
  );
}
