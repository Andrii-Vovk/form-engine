import { useFormBuilder } from "../FormBuilderContext";
import { StepTabs } from "./StepTabs";
import { StepCanvas } from "./StepCanvas";

export function FormCanvas() {
  const { activeStep } = useFormBuilder();

  return (
    <div className="flex h-full flex-col">
      <StepTabs />
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        {activeStep ? (
          <StepCanvas key={activeStep.id} step={activeStep} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Add a step to get started
          </div>
        )}
      </div>
    </div>
  );
}
