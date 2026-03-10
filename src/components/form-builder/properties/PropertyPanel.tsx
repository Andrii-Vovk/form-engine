import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormBuilder } from "../FormBuilderContext";
import { FieldPropertyEditor } from "./FieldPropertyEditor";

export function PropertyPanel() {
  const { selectedField, state } = useFormBuilder();

  if (!selectedField || !state.activeStepId) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Select a field to edit its properties
        </p>
      </div>
    );
  }

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
