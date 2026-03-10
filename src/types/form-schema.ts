// yup-ast node: each element is [methodName, ...args]
export type YupAstNode = [string, ...unknown[]];
// A field's validationSchema is an array of yup-ast nodes
export type YupAst = YupAstNode[];

export interface FormSchema {
  id: string;
  version: number;
  title: string;
  description?: string;
  steps: FormStep[];
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

export interface FieldLayout {
  column: number;
  colSpan: number;
  order?: number;
}

export interface DataMapping {
  prefillPath: string;
  submitPath: string;
}

export interface BaseField {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  tooltip?: string;
  defaultValue?: unknown;
  layout: FieldLayout;
  dataMapping: DataMapping;
  validationSchema: YupAst;
}

export interface TextField extends BaseField {
  type: "text";
}

export interface MaskedTextField extends BaseField {
  type: "maskedText";
  mask: { format: string; mask?: string; patternChar?: string };
}

export interface NumberField extends BaseField {
  type: "number";
}

export interface EmailField extends BaseField {
  type: "email";
}

export interface UrlField extends BaseField {
  type: "url";
}

export interface SelectEndpointBase {
  url: string;
  responsePath: string;
  searchParam?: string;
  infiniteScroll?: boolean;
}

export interface SelectSimpleEndpoint extends SelectEndpointBase {
  valuePath: string;
}

export interface SelectObjectEndpoint extends SelectEndpointBase {
  idPath: string;
  labelPath: string;
}

export interface SelectSimpleField extends BaseField {
  type: "selectSimple";
  options?: string[];
  endpoint?: SelectSimpleEndpoint;
}

export interface SelectObjectField extends BaseField {
  type: "selectObject";
  options?: Array<{ id: string; label: string }>;
  endpoint?: SelectObjectEndpoint;
}

export interface YachtMakeField extends BaseField {
  type: "yachtMake";
  setsField: string;
  config?: { showAllBrands?: boolean; searchTermAsOption?: boolean };
}

export interface YachtModelField extends BaseField {
  type: "yachtModel";
  dependsOn: { makeFieldName: string; makeNameFieldName: string };
  setsField?: string;
  config?: {
    showAllModels?: boolean;
    searchTermAsOption?: boolean;
    createDisabled?: boolean;
  };
}

export interface ArrayField extends BaseField {
  type: "array";
  arrayConfig: {
    addButtonLabel: string;
    removeButtonLabel?: string;
    defaultItem: Record<string, unknown>;
  };
  fields: FormField[];
}

export interface BooleanConditionalField extends BaseField {
  type: "conditional";
  conditionType: "boolean";
  defaultValue: boolean;
  branches: Record<string, FormField[]>;
}

export interface SelectConditionalField extends BaseField {
  type: "conditional";
  conditionType: "select";
  options: string[];
  defaultValue: string | null;
  branches: Record<string, FormField[]>;
}

export type ConditionalField =
  | BooleanConditionalField
  | SelectConditionalField;

export type FormField =
  | TextField
  | MaskedTextField
  | NumberField
  | EmailField
  | UrlField
  | SelectSimpleField
  | SelectObjectField
  | YachtMakeField
  | YachtModelField
  | ArrayField
  | ConditionalField;

export type FieldType = FormField["type"];
