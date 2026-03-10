# Form Builder JSON Schema - Design Plan

## Context

We need a JSON-serializable form definition format that can be stored in a database and parsed at runtime to dynamically build multi-step forms. The forms use react-hook-form and need runtime-generated validation. Current forms in the codebase (purchase-agreement, master-cover) are hand-coded with Zod schemas - this tool will make form creation data-driven.

**Key constraint:** Zod's `refine`/`superRefine` (needed for conditional fields) cannot be serialized to JSON. Instead, we'll use **yup-ast** (`@demvsystems/yup-ast`) which represents Yup schemas as JSON arrays, and Yup's `.when()` handles conditional validation natively.

**Scope:** JSON format and TypeScript types only. Runtime implementation (parser, renderer) will be planned separately.

---

## Design Decisions

- **`selectObject` stores the full `{id, label}` object** as the form value, validated as an object with required `id`/`label` fields
- **Conditionals support both boolean toggles AND select-based branching** (e.g., if vessel type is "sailboat" → show rigging fields)
- **Conditionals use flat naming** — child fields are independent siblings, not nested under the conditional's name
- **Validation via yup-ast per field** — each field carries a `validationSchema` property containing a yup-ast array. The runtime assembles all field schemas into a step-level `yup.object().shape({...})` and passes it to `yupResolver`. No custom `validation` property — yup-ast is the single source of truth for validation rules.
- **Selects support both static options and dynamic API endpoints** with optional infinite scroll

---

## JSON Format

### Top-Level Structure

```json
{
  "id": "form_abc123",
  "version": 1,
  "title": "Purchase Agreement",
  "steps": [
    {
      "id": "step_vessel_info",
      "title": "Vessel Information",
      "order": 0,
      "fields": []
    }
  ]
}
```

### Field Types

| Type | Component Mapping |
|------|------------------|
| `text` | `FormTextField` |
| `maskedText` | `FormTextField` type="pattern" |
| `number` | `FormNumberTextField` |
| `email` | `FormTextField` |
| `url` | `FormTextField` |
| `selectSimple` | `FormSelect` — static `options: string[]` OR dynamic `endpoint` |
| `selectObject` | `FormSelect` — static `options: {id, label}[]` OR dynamic `endpoint`, value stored as full object |
| `yachtMake` | `FormMakeSelect` |
| `yachtModel` | `FormModelSelect` |
| `array` | `useFieldArray` wrapper |
| `conditional` | Toggle or select + branches |

### Base Field Shape

```typescript
{
  id: string;                // unique field identifier
  type: FieldType;           // discriminator
  name: string;              // react-hook-form field path
  label: string;             // display label
  placeholder?: string;
  disabled?: boolean;
  tooltip?: string;
  defaultValue?: unknown;
  layout: { column: number; colSpan: number; order?: number };
  dataMapping: {
    prefillPath: string;     // dot-notation path in initial data to pre-fill from
    submitPath: string;      // dot-notation path in submit payload to write to
  };
  validationSchema: YupAst;  // yup-ast array defining this field's validation
}
```

**`validationSchema`** is a yup-ast array (serialized Yup schema). The runtime:
1. Reads each field's `validationSchema`
2. For conditional fields, wraps branch children in `yup.when()`
3. Assembles into `yup.object().shape({ [field.name]: transformAll(field.validationSchema), ... })`
4. Passes to `yupResolver` for react-hook-form

**`dataMapping`** tells the runtime:
- **`prefillPath`**: Where to read the initial value from the pre-fill data object. Dot-notation like `"buyer.contactInfo.email"`.
- **`submitPath`**: Where to place the field value in the outgoing submit payload. Dot-notation like `"buyerInfo.email"`.

### Field Examples

**Text:**
```json
{
  "type": "text", "name": "firstName", "label": "First Name",
  "validationSchema": [["yup.string"], ["yup.required", "First name is required"], ["yup.min", 2, "Must be at least 2 characters"], ["yup.max", 60, "Must be at most 60 characters"]],
  "dataMapping": { "prefillPath": "firstName", "submitPath": "firstName" }
}
```

**Number:**
```json
{
  "type": "number", "name": "vesselPrice", "label": "Vessel Price",
  "validationSchema": [["yup.number"], ["yup.required", "Price is required"], ["yup.min", 1000, "Must be at least $1,000"], ["yup.max", 1000000000, "Must be at most $1,000,000,000"]],
  "dataMapping": { "prefillPath": "vessel.price", "submitPath": "vessel.price" }
}
```

**Email:**
```json
{
  "type": "email", "name": "email", "label": "Email",
  "validationSchema": [["yup.string"], ["yup.required", "Email is required"], ["yup.email", "Must be a valid email"]],
  "dataMapping": { "prefillPath": "email", "submitPath": "email" }
}
```

**URL (optional):**
```json
{
  "type": "url", "name": "website", "label": "Website",
  "validationSchema": [["yup.string"], ["yup.url", "Must be a valid URL"], ["yup.nullable"]],
  "dataMapping": { "prefillPath": "website", "submitPath": "website" }
}
```

**Masked Text (phone):**
```json
{
  "type": "maskedText", "name": "phone", "label": "Phone",
  "mask": { "format": "+1 (###) ###-####", "mask": "_", "patternChar": "#" },
  "validationSchema": [["yup.string"], ["yup.required", "Phone is required"]],
  "dataMapping": { "prefillPath": "phone", "submitPath": "phone" }
}
```

**Select Simple — static:**
```json
{
  "type": "selectSimple", "name": "year", "label": "Year",
  "options": ["2020", "2021", "2022", "2023"],
  "validationSchema": [["yup.string"], ["yup.required", "Year is required"], ["yup.oneOf", ["2020", "2021", "2022", "2023"]]],
  "dataMapping": { "prefillPath": "year", "submitPath": "year" }
}
```

**Select Simple — dynamic from endpoint:**
```json
{
  "type": "selectSimple", "name": "country", "label": "Country",
  "endpoint": {
    "url": "/api/countries",
    "responsePath": "data.items",
    "valuePath": "name",
    "searchParam": "search",
    "infiniteScroll": true
  },
  "validationSchema": [["yup.string"], ["yup.required", "Country is required"]],
  "dataMapping": { "prefillPath": "country", "submitPath": "country" }
}
```

**Select Object — static (full object stored as value):**
```json
{
  "type": "selectObject", "name": "engineType", "label": "Engine Type",
  "options": [
    { "id": "inboard", "label": "Inboard" },
    { "id": "outboard", "label": "Outboard" }
  ],
  "validationSchema": [["yup.object"], ["yup.shape", { "id": [["yup.string"], ["yup.required"]], "label": [["yup.string"], ["yup.required"]] }], ["yup.required", "Engine type is required"]],
  "dataMapping": { "prefillPath": "engineType", "submitPath": "engineType" }
}
```

**Select Object — dynamic from endpoint:**
```json
{
  "type": "selectObject", "name": "hullMaterial", "label": "Hull Material",
  "endpoint": {
    "url": "/api/hull-materials",
    "responsePath": "data.results",
    "idPath": "materialId",
    "labelPath": "materialName",
    "searchParam": "q",
    "infiniteScroll": true
  },
  "validationSchema": [["yup.object"], ["yup.shape", { "id": [["yup.string"], ["yup.required"]], "label": [["yup.string"], ["yup.required"]] }], ["yup.nullable"]],
  "dataMapping": { "prefillPath": "hullMaterial", "submitPath": "hullMaterial" }
}
```

**Endpoint config explained:**
- `url` — API endpoint to fetch options from (always relative to our API)
- `responsePath` — dot-notation path to the array of items in the response (e.g., `"data.items"`, `"results"`)
- `valuePath` — (selectSimple only) dot-notation path to extract the string value from each item
- `idPath` / `labelPath` — (selectObject only) dot-notation paths to extract `id` and `label` from each item
- `searchParam` — query parameter name for search/filter text
- `infiniteScroll` — optional boolean; when `true`, the runtime handles pagination internally

### Conditional Fields — Flat Naming (not nested)

Child fields are **independent siblings**, not nested under the conditional's name. This works cleanly for both boolean and select-based conditionals because:
- Boolean conditional: `hasTradeIn` = `true/false`, `tradeInValue` is a sibling
- Select conditional: `vesselType` = `"sailboat"` (a string), `riggingType` is a sibling

If children were nested (e.g., `vesselType.riggingType`), it would conflict with `vesselType` being a plain string. Flat naming avoids this. Cleanup on branch switch is handled by unregistering inactive branch fields.

**Boolean Toggle:**
```json
{
  "type": "conditional",
  "name": "hasTradeIn",
  "label": "Do you have a trade-in?",
  "conditionType": "boolean",
  "defaultValue": false,
  "validationSchema": [["yup.boolean"], ["yup.required", "This field is required"]],
  "branches": {
    "true": [
      {
        "type": "number", "name": "tradeInValue", "label": "Trade-In Value",
        "validationSchema": [["yup.number"], ["yup.required", "Trade-in value is required"], ["yup.min", 1, "Must be at least $1"]],
        "dataMapping": { "prefillPath": "tradeIn.value", "submitPath": "tradeIn.value" }
      }
    ],
    "false": []
  },
  "dataMapping": { "prefillPath": "hasTradeIn", "submitPath": "hasTradeIn" }
}
```

The runtime wraps branch children's schemas in `yup.when()`:
```
tradeInValue: yup.when("hasTradeIn", {
  is: true,
  then: yup.number().required().min(1),
  otherwise: yup.mixed().nullable().optional()
})
```

**Select-Based:**
```json
{
  "type": "conditional",
  "name": "vesselType",
  "label": "Vessel Type",
  "conditionType": "select",
  "options": ["sailboat", "powerboat", "other"],
  "defaultValue": null,
  "validationSchema": [["yup.string"], ["yup.required", "Vessel type is required"], ["yup.oneOf", ["sailboat", "powerboat", "other"]]],
  "branches": {
    "sailboat": [
      {
        "type": "text", "name": "riggingType", "label": "Rigging Type",
        "validationSchema": [["yup.string"], ["yup.required", "Rigging type is required"]],
        "dataMapping": { "prefillPath": "vessel.riggingType", "submitPath": "vessel.riggingType" }
      }
    ],
    "powerboat": [
      {
        "type": "number", "name": "engineCount", "label": "Number of Engines",
        "validationSchema": [["yup.number"], ["yup.required", "Required"], ["yup.min", 1], ["yup.max", 6]],
        "dataMapping": { "prefillPath": "vessel.engineCount", "submitPath": "vessel.engineCount" }
      }
    ],
    "other": []
  },
  "dataMapping": { "prefillPath": "vessel.type", "submitPath": "vessel.type" }
}
```

### Array Field

```json
{
  "type": "array",
  "name": "deposits",
  "label": "Deposits",
  "validationSchema": [["yup.array"], ["yup.min", 1, "At least one deposit is required"], ["yup.max", 6, "Maximum 6 deposits"]],
  "arrayConfig": {
    "addButtonLabel": "Add Deposit",
    "removeButtonLabel": "Remove",
    "defaultItem": { "name": "", "amount": null }
  },
  "fields": [
    {
      "type": "text", "name": "name", "label": "Name",
      "validationSchema": [["yup.string"], ["yup.required", "Name is required"], ["yup.max", 60]],
      "dataMapping": { "prefillPath": "name", "submitPath": "name" }
    },
    {
      "type": "number", "name": "amount", "label": "Amount",
      "validationSchema": [["yup.number"], ["yup.required", "Amount is required"], ["yup.min", 0.01, "Must be greater than 0"]],
      "dataMapping": { "prefillPath": "amount", "submitPath": "amount" }
    }
  ],
  "dataMapping": { "prefillPath": "financial.deposits", "submitPath": "financial.deposits" }
}
```

The runtime builds: `yup.array().of(yup.object().shape({ name: ..., amount: ... })).min(1).max(6)`

Note: `minItems`/`maxItems` moved into the yup-ast `validationSchema` (as `yup.min`/`yup.max`). The `arrayConfig` now only holds UI concerns (button labels, default item template).

### Make/Model Linking

```json
{
  "type": "yachtMake", "name": "makeId", "label": "Make",
  "setsField": "makeName",
  "config": { "showAllBrands": false, "searchTermAsOption": true },
  "validationSchema": [["yup.string"], ["yup.required", "Make is required"]],
  "dataMapping": { "prefillPath": "vessel.makeId", "submitPath": "vessel.makeId" }
}
```
```json
{
  "type": "yachtModel", "name": "modelId", "label": "Model",
  "dependsOn": { "makeFieldName": "makeId", "makeNameFieldName": "makeName" },
  "setsField": "modelName",
  "validationSchema": [["yup.string"], ["yup.required", "Model is required"]],
  "dataMapping": { "prefillPath": "vessel.modelId", "submitPath": "vessel.modelId" }
}
```

- `setsField` writes selected option's label to a hidden form field (via `setValue`)
- `dependsOn` passes watched `makeId` as `watchBrandId` to `FormModelSelect`, resets on change

---

## Validation: yup-ast per field → assembled step schema

Each field's `validationSchema` is a yup-ast array. The runtime assembles them into a step-level schema:

```typescript
const shape: Record<string, any> = {};

for (const field of step.fields) {
  if (field.type === 'conditional') {
    // Conditional's own schema (the toggle/select itself)
    shape[field.name] = transformAll(field.validationSchema);
    // Branch children wrapped in yup.when()
    for (const branchField of allBranchFields) {
      shape[branchField.name] = transformAll([
        ...branchField.validationSchema,
        ["yup.when", field.name, { is: branchValue, then: branchField.validationSchema, otherwise: [["yup.mixed"], ["yup.nullable"]] }]
      ]);
    }
  } else if (field.type === 'array') {
    // Array schema wraps child fields into yup.array().of(yup.object().shape({...}))
    const itemShape = {};
    for (const child of field.fields) {
      itemShape[child.name] = transformAll(child.validationSchema);
    }
    shape[field.name] = yup.array().of(yup.object().shape(itemShape));
    // Then apply array-level validations from field.validationSchema
  } else {
    shape[field.name] = transformAll(field.validationSchema);
  }
}

const stepSchema = yup.object().shape(shape);
```

### yup-ast examples

| Scenario | yup-ast |
|---|---|
| Required string, 2-60 chars | `[["yup.string"], ["yup.required", "..."], ["yup.min", 2], ["yup.max", 60]]` |
| Required number, 1000-1B | `[["yup.number"], ["yup.required", "..."], ["yup.min", 1000], ["yup.max", 1000000000]]` |
| Required email | `[["yup.string"], ["yup.required", "..."], ["yup.email", "..."]]` |
| Optional URL | `[["yup.string"], ["yup.url", "..."], ["yup.nullable"]]` |
| Required selectObject | `[["yup.object"], ["yup.shape", {"id": [...], "label": [...]}], ["yup.required"]]` |
| Required boolean | `[["yup.boolean"], ["yup.required", "..."]]` |
| Array 1-6 items | `[["yup.array"], ["yup.min", 1], ["yup.max", 6]]` |

Result passed to `transformAll()` from `@demvsystems/yup-ast` → Yup schema → `yupResolver`.

---

## TypeScript Types

```typescript
// yup-ast node: each element is [methodName, ...args]
type YupAstNode = [string, ...unknown[]];
// A field's validationSchema is an array of yup-ast nodes
type YupAst = YupAstNode[];

interface FormSchema {
  id: string;
  version: number;
  title: string;
  description?: string;
  steps: FormStep[];
}

interface FormStep {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

interface FieldLayout {
  column: number;
  colSpan: number;
  order?: number;
}

interface DataMapping {
  prefillPath: string;
  submitPath: string;
}

interface BaseField {
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

interface TextField extends BaseField {
  type: 'text';
}

interface MaskedTextField extends BaseField {
  type: 'maskedText';
  mask: { format: string; mask?: string; patternChar?: string };
}

interface NumberField extends BaseField {
  type: 'number';
}

interface EmailField extends BaseField {
  type: 'email';
}

interface UrlField extends BaseField {
  type: 'url';
}

interface SelectEndpointBase {
  url: string;
  responsePath: string;
  searchParam?: string;
  infiniteScroll?: boolean;
}

interface SelectSimpleEndpoint extends SelectEndpointBase {
  valuePath: string;
}

interface SelectObjectEndpoint extends SelectEndpointBase {
  idPath: string;
  labelPath: string;
}

interface SelectSimpleField extends BaseField {
  type: 'selectSimple';
  options?: string[];
  endpoint?: SelectSimpleEndpoint;
}

interface SelectObjectField extends BaseField {
  type: 'selectObject';
  options?: Array<{ id: string; label: string }>;
  endpoint?: SelectObjectEndpoint;
}

interface YachtMakeField extends BaseField {
  type: 'yachtMake';
  setsField: string;
  config?: { showAllBrands?: boolean; searchTermAsOption?: boolean };
}

interface YachtModelField extends BaseField {
  type: 'yachtModel';
  dependsOn: { makeFieldName: string; makeNameFieldName: string };
  setsField?: string;
  config?: { showAllModels?: boolean; searchTermAsOption?: boolean; createDisabled?: boolean };
}

interface ArrayField extends BaseField {
  type: 'array';
  arrayConfig: {
    addButtonLabel: string;
    removeButtonLabel?: string;
    defaultItem: Record<string, unknown>;
  };
  fields: FormField[];
}

interface BooleanConditionalField extends BaseField {
  type: 'conditional';
  conditionType: 'boolean';
  defaultValue: boolean;
  branches: {
    true: FormField[];
    false: FormField[];
  };
}

interface SelectConditionalField extends BaseField {
  type: 'conditional';
  conditionType: 'select';
  options: string[];
  defaultValue: string | null;
  branches: Record<string, FormField[]>;
}

type ConditionalField = BooleanConditionalField | SelectConditionalField;

type FormField =
  | TextField | MaskedTextField | NumberField | EmailField | UrlField
  | SelectSimpleField | SelectObjectField
  | YachtMakeField | YachtModelField
  | ArrayField | ConditionalField;
```

---

## New Dependencies

- `yup` - validation library
- `@demvsystems/yup-ast` - JSON AST → Yup schema conversion
- `@hookform/resolvers` (already exists, use `yupResolver` alongside existing `zodResolver`)

## Key Existing Files to Reuse

- `/yachtway-frontend/src/core/config/validation.ts` - validation message patterns
- `/design-system/src/components/common/form-text-field/` - text field with pattern/numeric support
- `/yachtway-frontend/src/ui/es-components/form-make-select/` - yacht make select
- `/yachtway-frontend/src/ui/es-components/form-model-select/` - yacht model select
- `/yachtway-frontend/src/ui/es-components/form-toggle-block-yes-no/` - yes/no toggle
- `/yachtway-frontend/src/ui/views/purchase-agreement/deposits/` - useFieldArray reference
