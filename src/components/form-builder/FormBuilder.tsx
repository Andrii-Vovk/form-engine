import { FormBuilderProvider, useFormBuilder } from "./FormBuilderContext";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { FieldPalette } from "./palette/FieldPalette";
import { FormCanvas } from "./canvas/FormCanvas";
import { PropertyPanel } from "./properties/PropertyPanel";
import { BuilderToolbar } from "./toolbar/BuilderToolbar";
import { DragDropProvider } from "@dnd-kit/react";
import type { FieldType } from "@/types/form-schema";
import { isSortable } from "@dnd-kit/dom/sortable";

function FormBuilderInner() {
  const { state, dispatch } = useFormBuilder();

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const { source, target } = event.operation;

        // No source, canceled, or no valid drop target — do nothing
        if (!source || event.canceled || !target) return;

        const sourceData = source.data as Record<string, unknown> | undefined;
        const targetData = target.data as Record<string, unknown> | undefined;

        // Palette → drop zone
        if (sourceData?.source === "palette" && state.activeStepId) {
          const fieldType = sourceData.fieldType as FieldType;

          // Dropped on a conditional branch zone
          if (targetData?.source === "branch") {
            dispatch({
              type: "ADD_BRANCH_FIELD",
              payload: {
                stepId: targetData.stepId as string,
                conditionalFieldId: targetData.conditionalFieldId as string,
                branchKey: targetData.branchKey as string,
                fieldType,
              },
            });
            return;
          }

          // Dropped on an array child zone
          if (targetData?.source === "array") {
            dispatch({
              type: "ADD_ARRAY_CHILD_FIELD",
              payload: {
                stepId: targetData.stepId as string,
                arrayFieldId: targetData.arrayFieldId as string,
                fieldType,
              },
            });
            return;
          }

          // Dropped on a canvas sortable item — insert at that position
          if (isSortable(target)) {
            dispatch({
              type: "ADD_FIELD",
              payload: {
                stepId: state.activeStepId,
                fieldType,
                index: target.index,
              },
            });
            return;
          }

          // Dropped on the canvas droppable itself (empty area) — append
          if (targetData?.stepId) {
            dispatch({
              type: "ADD_FIELD",
              payload: {
                stepId: targetData.stepId as string,
                fieldType,
              },
            });
          }
          return;
        }

        // Canvas reorder: sync sortable state
        if (sourceData?.source === "canvas" && isSortable(source)) {
          const fromIndex = source.initialIndex;
          const toIndex = source.index;
          const stepId = sourceData.stepId as string;
          if (fromIndex !== toIndex) {
            dispatch({
              type: "REORDER_FIELDS",
              payload: { stepId, fromIndex, toIndex },
            });
          }
        }
      }}
    >
      <div className="flex h-screen flex-col">
        <BuilderToolbar />
        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize="15%" minSize="12%" maxSize="25%">
            <FieldPalette />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="60%" minSize="20%">
            <FormCanvas />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="25%" minSize="20%" maxSize="40%">
            <PropertyPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DragDropProvider>
  );
}

export function FormBuilder() {
  return (
    <FormBuilderProvider>
      <FormBuilderInner />
    </FormBuilderProvider>
  );
}
