import { PlusIcon, XIcon } from "lucide-react";
import { useFormBuilder } from "../FormBuilderContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StepTabs() {
  const { state, dispatch } = useFormBuilder();
  const { steps } = state.schema;

  return (
    <div className="flex items-center gap-1 border-b bg-background px-2">
      <div className="flex flex-1 items-center gap-0.5 overflow-x-auto py-1">
        {steps.map((step) => (
          <div key={step.id} className="group flex items-center">
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_ACTIVE_STEP", payload: { stepId: step.id } })
              }
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                state.activeStepId === step.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {step.title}
            </button>
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "REMOVE_STEP",
                    payload: { stepId: step.id },
                  })
                }
                className="ml-0.5 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => dispatch({ type: "ADD_STEP" })}
        className="shrink-0"
      >
        <PlusIcon className="size-4" />
        Add Step
      </Button>
    </div>
  );
}
