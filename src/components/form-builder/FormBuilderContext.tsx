import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { generateId } from "@/lib/id";
import { createDefaultField } from "@/types/field-defaults";
import type {
  FormSchema,
  FormStep,
  FormField,
  FieldType,
} from "@/types/form-schema";

// --- State ---

export interface FieldSelection {
  fieldId: string;
  parentPath?: {
    parentFieldId: string;
    branchKey?: string;
  };
}

export interface FormBuilderState {
  schema: FormSchema;
  activeStepId: string | null;
  selection: FieldSelection | null;
}

// --- Actions ---

export type FormBuilderAction =
  | { type: "SET_SCHEMA"; payload: FormSchema }
  | {
      type: "UPDATE_SCHEMA_META";
      payload: Partial<Pick<FormSchema, "title" | "description">>;
    }
  // Steps
  | { type: "ADD_STEP" }
  | { type: "REMOVE_STEP"; payload: { stepId: string } }
  | {
      type: "UPDATE_STEP";
      payload: {
        stepId: string;
        changes: Partial<Pick<FormStep, "title" | "description">>;
      };
    }
  | {
      type: "REORDER_STEPS";
      payload: { fromIndex: number; toIndex: number };
    }
  | { type: "SET_ACTIVE_STEP"; payload: { stepId: string } }
  // Fields
  | {
      type: "ADD_FIELD";
      payload: { stepId: string; fieldType: FieldType; index?: number };
    }
  | { type: "REMOVE_FIELD"; payload: { stepId: string; fieldId: string } }
  | {
      type: "UPDATE_FIELD";
      payload: {
        stepId: string;
        fieldId: string;
        changes: Partial<FormField>;
        parentPath?: { parentFieldId: string; branchKey?: string };
      };
    }
  | {
      type: "REORDER_FIELDS";
      payload: { stepId: string; fromIndex: number; toIndex: number };
    }
  // Nested fields
  | {
      type: "ADD_BRANCH_FIELD";
      payload: {
        stepId: string;
        conditionalFieldId: string;
        branchKey: string;
        fieldType: FieldType;
      };
    }
  | {
      type: "ADD_ARRAY_CHILD_FIELD";
      payload: {
        stepId: string;
        arrayFieldId: string;
        fieldType: FieldType;
      };
    }
  | {
      type: "REMOVE_NESTED_FIELD";
      payload: {
        stepId: string;
        parentFieldId: string;
        fieldId: string;
        branchKey?: string;
      };
    }
  // Selection
  | { type: "SELECT_FIELD"; payload: FieldSelection | null }
  // Conditional branches
  | {
      type: "ADD_BRANCH";
      payload: { stepId: string; fieldId: string; branchKey: string };
    }
  | {
      type: "REMOVE_BRANCH";
      payload: { stepId: string; fieldId: string; branchKey: string };
    };

// --- Helpers ---

function createDefaultStep(order: number): FormStep {
  return {
    id: generateId("step"),
    title: `Step ${order + 1}`,
    order,
    fields: [],
  };
}

function updateStepFields(
  steps: FormStep[],
  stepId: string,
  updater: (fields: FormField[]) => FormField[]
): FormStep[] {
  return steps.map((step) =>
    step.id === stepId ? { ...step, fields: updater(step.fields) } : step
  );
}

function updateFieldInList(
  fields: FormField[],
  fieldId: string,
  updater: (field: FormField) => FormField
): FormField[] {
  return fields.map((f) => (f.id === fieldId ? updater(f) : f));
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

// --- Reducer ---

function formBuilderReducer(
  state: FormBuilderState,
  action: FormBuilderAction
): FormBuilderState {
  switch (action.type) {
    case "SET_SCHEMA": {
      const schema = action.payload;
      return {
        schema,
        activeStepId: schema.steps[0]?.id ?? null,
        selection: null,
      };
    }

    case "UPDATE_SCHEMA_META":
      return {
        ...state,
        schema: { ...state.schema, ...action.payload },
      };

    // --- Steps ---

    case "ADD_STEP": {
      const newStep = createDefaultStep(state.schema.steps.length);
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: [...state.schema.steps, newStep],
        },
        activeStepId: newStep.id,
        selection: null,
      };
    }

    case "REMOVE_STEP": {
      const { stepId } = action.payload;
      const steps = state.schema.steps.filter((s) => s.id !== stepId);
      // Recompute order
      const reordered = steps.map((s, i) => ({ ...s, order: i }));
      const activeStepId =
        state.activeStepId === stepId
          ? reordered[0]?.id ?? null
          : state.activeStepId;
      return {
        ...state,
        schema: { ...state.schema, steps: reordered },
        activeStepId,
        selection:
          state.activeStepId === stepId ? null : state.selection,
      };
    }

    case "UPDATE_STEP":
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: state.schema.steps.map((s) =>
            s.id === action.payload.stepId
              ? { ...s, ...action.payload.changes }
              : s
          ),
        },
      };

    case "REORDER_STEPS": {
      const { fromIndex, toIndex } = action.payload;
      const steps = arrayMove(state.schema.steps, fromIndex, toIndex).map(
        (s, i) => ({ ...s, order: i })
      );
      return { ...state, schema: { ...state.schema, steps } };
    }

    case "SET_ACTIVE_STEP":
      return {
        ...state,
        activeStepId: action.payload.stepId,
        selection: null,
      };

    // --- Fields ---

    case "ADD_FIELD": {
      const { stepId, fieldType, index } = action.payload;
      const newField = createDefaultField(fieldType);
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: updateStepFields(state.schema.steps, stepId, (fields) => {
            if (index !== undefined) {
              const result = [...fields];
              result.splice(index, 0, newField);
              return result;
            }
            return [...fields, newField];
          }),
        },
        selection: { fieldId: newField.id },
      };
    }

    case "REMOVE_FIELD": {
      const { stepId, fieldId } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: updateStepFields(state.schema.steps, stepId, (fields) =>
            fields.filter((f) => f.id !== fieldId)
          ),
        },
        selection:
          state.selection?.fieldId === fieldId ? null : state.selection,
      };
    }

    case "UPDATE_FIELD": {
      const { stepId, fieldId, changes, parentPath } = action.payload;
      if (parentPath) {
        // Updating a nested field (inside conditional branch or array)
        return {
          ...state,
          schema: {
            ...state.schema,
            steps: updateStepFields(state.schema.steps, stepId, (fields) =>
              updateFieldInList(fields, parentPath.parentFieldId, (parent) => {
                if (parent.type === "conditional" && parentPath.branchKey) {
                  const branches = { ...parent.branches };
                  branches[parentPath.branchKey] = updateFieldInList(
                    branches[parentPath.branchKey] || [],
                    fieldId,
                    (f) => ({ ...f, ...changes } as FormField)
                  );
                  return { ...parent, branches } as FormField;
                }
                if (parent.type === "array") {
                  return {
                    ...parent,
                    fields: updateFieldInList(
                      parent.fields,
                      fieldId,
                      (f) => ({ ...f, ...changes } as FormField)
                    ),
                  } as FormField;
                }
                return parent;
              })
            ),
          },
        };
      }
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: updateStepFields(state.schema.steps, stepId, (fields) =>
            updateFieldInList(
              fields,
              fieldId,
              (f) => ({ ...f, ...changes } as FormField)
            )
          ),
        },
      };
    }

    case "REORDER_FIELDS": {
      const { stepId, fromIndex, toIndex } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: updateStepFields(state.schema.steps, stepId, (fields) =>
            arrayMove(fields, fromIndex, toIndex)
          ),
        },
      };
    }

    // --- Nested fields ---

    case "ADD_BRANCH_FIELD": {
      const { stepId, conditionalFieldId, branchKey, fieldType } =
        action.payload;
      const newField = createDefaultField(fieldType);
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: updateStepFields(state.schema.steps, stepId, (fields) =>
            updateFieldInList(fields, conditionalFieldId, (parent) => {
              if (parent.type !== "conditional") return parent;
              const branches = { ...parent.branches };
              branches[branchKey] = [
                ...(branches[branchKey] || []),
                newField,
              ];
              return { ...parent, branches } as FormField;
            })
          ),
        },
        selection: {
          fieldId: newField.id,
          parentPath: { parentFieldId: conditionalFieldId, branchKey },
        },
      };
    }

    case "ADD_ARRAY_CHILD_FIELD": {
      const { stepId, arrayFieldId, fieldType } = action.payload;
      const newField = createDefaultField(fieldType);
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: updateStepFields(state.schema.steps, stepId, (fields) =>
            updateFieldInList(fields, arrayFieldId, (parent) => {
              if (parent.type !== "array") return parent;
              return {
                ...parent,
                fields: [...parent.fields, newField],
              } as FormField;
            })
          ),
        },
        selection: {
          fieldId: newField.id,
          parentPath: { parentFieldId: arrayFieldId },
        },
      };
    }

    case "REMOVE_NESTED_FIELD": {
      const { stepId, parentFieldId, fieldId, branchKey } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: updateStepFields(state.schema.steps, stepId, (fields) =>
            updateFieldInList(fields, parentFieldId, (parent) => {
              if (parent.type === "conditional" && branchKey) {
                const branches = { ...parent.branches };
                branches[branchKey] = (branches[branchKey] || []).filter(
                  (f) => f.id !== fieldId
                );
                return { ...parent, branches } as FormField;
              }
              if (parent.type === "array") {
                return {
                  ...parent,
                  fields: parent.fields.filter((f) => f.id !== fieldId),
                } as FormField;
              }
              return parent;
            })
          ),
        },
        selection:
          state.selection?.fieldId === fieldId ? null : state.selection,
      };
    }

    // --- Selection ---

    case "SELECT_FIELD":
      return { ...state, selection: action.payload };

    // --- Conditional branches ---

    case "ADD_BRANCH": {
      const { stepId, fieldId, branchKey } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: updateStepFields(state.schema.steps, stepId, (fields) =>
            updateFieldInList(fields, fieldId, (f) => {
              if (f.type !== "conditional") return f;
              return {
                ...f,
                branches: { ...f.branches, [branchKey]: [] },
              } as FormField;
            })
          ),
        },
      };
    }

    case "REMOVE_BRANCH": {
      const { stepId, fieldId, branchKey } = action.payload;
      return {
        ...state,
        schema: {
          ...state.schema,
          steps: updateStepFields(state.schema.steps, stepId, (fields) =>
            updateFieldInList(fields, fieldId, (f) => {
              if (f.type !== "conditional") return f;
              const branches = { ...f.branches };
              delete branches[branchKey];
              return { ...f, branches } as FormField;
            })
          ),
        },
      };
    }

    default:
      return state;
  }
}

// --- Initial state ---

function createInitialState(): FormBuilderState {
  const initialStep = createDefaultStep(0);
  return {
    schema: {
      id: generateId("form"),
      version: 1,
      title: "Untitled Form",
      steps: [initialStep],
    },
    activeStepId: initialStep.id,
    selection: null,
  };
}

// --- Context ---

interface FormBuilderContextValue {
  state: FormBuilderState;
  dispatch: Dispatch<FormBuilderAction>;
  activeStep: FormStep | null;
  selectedField: FormField | null;
}

const FormBuilderContext = createContext<FormBuilderContextValue | null>(null);

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formBuilderReducer, undefined, createInitialState);

  const activeStep =
    state.schema.steps.find((s) => s.id === state.activeStepId) ?? null;

  let selectedField: FormField | null = null;
  if (state.selection && activeStep) {
    const { fieldId, parentPath } = state.selection;
    if (parentPath) {
      const parent = activeStep.fields.find(
        (f) => f.id === parentPath.parentFieldId
      );
      if (parent?.type === "conditional" && parentPath.branchKey) {
        selectedField =
          parent.branches[parentPath.branchKey]?.find(
            (f) => f.id === fieldId
          ) ?? null;
      } else if (parent?.type === "array") {
        selectedField =
          parent.fields.find((f) => f.id === fieldId) ?? null;
      }
    } else {
      selectedField =
        activeStep.fields.find((f) => f.id === fieldId) ?? null;
    }
  }

  return (
    <FormBuilderContext.Provider
      value={{ state, dispatch, activeStep, selectedField }}
    >
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilder() {
  const ctx = useContext(FormBuilderContext);
  if (!ctx) {
    throw new Error("useFormBuilder must be used within FormBuilderProvider");
  }
  return ctx;
}
