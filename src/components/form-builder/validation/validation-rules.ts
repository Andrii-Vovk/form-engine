export interface RuleParam {
  name: string;
  type: "string" | "number" | "string[]";
  label: string;
  default?: unknown;
}

export interface ValidationRuleDef {
  key: string;
  label: string;
  yupMethod: string;
  params: RuleParam[];
}

export const VALIDATION_RULES: Record<string, ValidationRuleDef[]> = {
  string: [
    {
      key: "required",
      label: "Required",
      yupMethod: "yup.required",
      params: [{ name: "message", type: "string", label: "Message", default: "" }],
    },
    {
      key: "min",
      label: "Min Length",
      yupMethod: "yup.min",
      params: [
        { name: "length", type: "number", label: "Min" },
        { name: "message", type: "string", label: "Message", default: "" },
      ],
    },
    {
      key: "max",
      label: "Max Length",
      yupMethod: "yup.max",
      params: [
        { name: "length", type: "number", label: "Max" },
        { name: "message", type: "string", label: "Message", default: "" },
      ],
    },
    {
      key: "email",
      label: "Email",
      yupMethod: "yup.email",
      params: [{ name: "message", type: "string", label: "Message", default: "Must be a valid email" }],
    },
    {
      key: "url",
      label: "URL",
      yupMethod: "yup.url",
      params: [{ name: "message", type: "string", label: "Message", default: "Must be a valid URL" }],
    },
    {
      key: "matches",
      label: "Regex",
      yupMethod: "yup.matches",
      params: [
        { name: "regex", type: "string", label: "Pattern" },
        { name: "message", type: "string", label: "Message", default: "" },
      ],
    },
    {
      key: "oneOf",
      label: "One Of",
      yupMethod: "yup.oneOf",
      params: [
        { name: "values", type: "string[]", label: "Values" },
        { name: "message", type: "string", label: "Message", default: "" },
      ],
    },
    {
      key: "nullable",
      label: "Nullable",
      yupMethod: "yup.nullable",
      params: [],
    },
  ],
  number: [
    {
      key: "required",
      label: "Required",
      yupMethod: "yup.required",
      params: [{ name: "message", type: "string", label: "Message", default: "" }],
    },
    {
      key: "min",
      label: "Minimum",
      yupMethod: "yup.min",
      params: [
        { name: "value", type: "number", label: "Min" },
        { name: "message", type: "string", label: "Message", default: "" },
      ],
    },
    {
      key: "max",
      label: "Maximum",
      yupMethod: "yup.max",
      params: [
        { name: "value", type: "number", label: "Max" },
        { name: "message", type: "string", label: "Message", default: "" },
      ],
    },
    {
      key: "positive",
      label: "Positive",
      yupMethod: "yup.positive",
      params: [{ name: "message", type: "string", label: "Message", default: "" }],
    },
    {
      key: "integer",
      label: "Integer",
      yupMethod: "yup.integer",
      params: [{ name: "message", type: "string", label: "Message", default: "" }],
    },
    {
      key: "nullable",
      label: "Nullable",
      yupMethod: "yup.nullable",
      params: [],
    },
  ],
  boolean: [
    {
      key: "required",
      label: "Required",
      yupMethod: "yup.required",
      params: [{ name: "message", type: "string", label: "Message", default: "" }],
    },
  ],
  object: [
    {
      key: "required",
      label: "Required",
      yupMethod: "yup.required",
      params: [{ name: "message", type: "string", label: "Message", default: "" }],
    },
    {
      key: "nullable",
      label: "Nullable",
      yupMethod: "yup.nullable",
      params: [],
    },
  ],
  array: [
    {
      key: "min",
      label: "Min Items",
      yupMethod: "yup.min",
      params: [
        { name: "value", type: "number", label: "Min" },
        { name: "message", type: "string", label: "Message", default: "" },
      ],
    },
    {
      key: "max",
      label: "Max Items",
      yupMethod: "yup.max",
      params: [
        { name: "value", type: "number", label: "Max" },
        { name: "message", type: "string", label: "Message", default: "" },
      ],
    },
  ],
};

/** Get the base yup type for a field type */
export function getYupBaseType(
  fieldType: string
): string {
  switch (fieldType) {
    case "text":
    case "maskedText":
    case "email":
    case "url":
    case "selectSimple":
    case "yachtMake":
    case "yachtModel":
      return "string";
    case "number":
      return "number";
    case "selectObject":
      return "object";
    case "array":
      return "array";
    case "conditional":
      return "boolean"; // default; select conditionals use string
    default:
      return "string";
  }
}

/** Get available rules for a field type */
export function getRulesForFieldType(fieldType: string): ValidationRuleDef[] {
  const baseType = getYupBaseType(fieldType);
  return VALIDATION_RULES[baseType] ?? [];
}
