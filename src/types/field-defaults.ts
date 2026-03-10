import { generateId } from "@/lib/id";
import type {
  FieldType,
  FormField,
  TextField,
  MaskedTextField,
  NumberField,
  EmailField,
  UrlField,
  SelectSimpleField,
  SelectObjectField,
  YachtMakeField,
  YachtModelField,
  ArrayField,
  BooleanConditionalField,
  BaseField,
} from "./form-schema";

function baseDefaults(name: string, label: string): Omit<BaseField, "validationSchema"> {
  const id = generateId("f");
  return {
    id,
    name,
    label,
    placeholder: "",
    defaultValue: "",
    layout: { column: 1, colSpan: 1 },
    dataMapping: { prefillPath: name, submitPath: name },
  };
}

function nextName(prefix: string): string {
  // Use a short random suffix from the ID generator to avoid numbering gaps
  const suffix = generateId("").slice(0, 4);
  return `${prefix}_${suffix}`;
}

const fieldFactories: Record<FieldType, () => FormField> = {
  text: (): TextField => {
    const name = nextName("textField");
    return {
      ...baseDefaults(name, "Text Field"),
      type: "text",
      validationSchema: [["yup.string"]],
    };
  },

  maskedText: (): MaskedTextField => {
    const name = nextName("maskedField");
    return {
      ...baseDefaults(name, "Masked Text"),
      type: "maskedText",
      mask: { format: "+1 (###) ###-####", mask: "_", patternChar: "#" },
      validationSchema: [["yup.string"]],
    };
  },

  number: (): NumberField => {
    const name = nextName("numberField");
    return {
      ...baseDefaults(name, "Number Field"),
      type: "number",
      defaultValue: null,
      validationSchema: [["yup.number"]],
    };
  },

  email: (): EmailField => {
    const name = nextName("emailField");
    return {
      ...baseDefaults(name, "Email"),
      type: "email",
      placeholder: "you@example.com",
      validationSchema: [["yup.string"], ["yup.email", "Must be a valid email"]],
    };
  },

  url: (): UrlField => {
    const name = nextName("urlField");
    return {
      ...baseDefaults(name, "URL"),
      type: "url",
      placeholder: "https://example.com",
      validationSchema: [["yup.string"], ["yup.url", "Must be a valid URL"]],
    };
  },

  selectSimple: (): SelectSimpleField => {
    const name = nextName("selectField");
    return {
      ...baseDefaults(name, "Select"),
      type: "selectSimple",
      defaultValue: null,
      options: ["Option 1", "Option 2", "Option 3"],
      validationSchema: [["yup.string"]],
    };
  },

  selectObject: (): SelectObjectField => {
    const name = nextName("selectObjField");
    return {
      ...baseDefaults(name, "Object Select"),
      type: "selectObject",
      defaultValue: null,
      options: [
        { id: "opt1", label: "Option 1" },
        { id: "opt2", label: "Option 2" },
      ],
      validationSchema: [
        ["yup.object"],
        [
          "yup.shape",
          {
            id: [["yup.string"], ["yup.required"]],
            label: [["yup.string"], ["yup.required"]],
          },
        ],
      ],
    };
  },

  yachtMake: (): YachtMakeField => {
    const name = nextName("makeField");
    return {
      ...baseDefaults(name, "Make"),
      type: "yachtMake",
      defaultValue: null,
      setsField: "makeName",
      config: { showAllBrands: false, searchTermAsOption: true },
      validationSchema: [["yup.string"]],
    };
  },

  yachtModel: (): YachtModelField => {
    const name = nextName("modelField");
    return {
      ...baseDefaults(name, "Model"),
      type: "yachtModel",
      defaultValue: null,
      dependsOn: { makeFieldName: "makeId", makeNameFieldName: "makeName" },
      setsField: "modelName",
      config: { showAllModels: false, searchTermAsOption: true },
      validationSchema: [["yup.string"]],
    };
  },

  array: (): ArrayField => {
    const name = nextName("arrayField");
    return {
      ...baseDefaults(name, "Array"),
      type: "array",
      defaultValue: [],
      arrayConfig: {
        addButtonLabel: "Add Item",
        removeButtonLabel: "Remove",
        defaultItem: {},
      },
      fields: [],
      validationSchema: [["yup.array"]],
    };
  },

  conditional: (): BooleanConditionalField => {
    const name = nextName("conditionalField");
    return {
      ...baseDefaults(name, "Conditional"),
      type: "conditional",
      conditionType: "boolean",
      defaultValue: false,
      branches: { true: [], false: [] },
      validationSchema: [["yup.boolean"]],
    };
  },
};

export function createDefaultField(type: FieldType): FormField {
  return fieldFactories[type]();
}
