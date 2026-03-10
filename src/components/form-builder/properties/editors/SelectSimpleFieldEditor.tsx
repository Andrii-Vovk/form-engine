import { PlusIcon, XIcon } from "lucide-react";
import type { SelectSimpleField } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface Props {
  field: SelectSimpleField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function SelectSimpleFieldEditor({ field, stepId, parentPath }: Props) {
  const { dispatch } = useFormBuilder();
  const [useEndpoint, setUseEndpoint] = useState(!!field.endpoint);

  function update(changes: Partial<SelectSimpleField>) {
    dispatch({
      type: "UPDATE_FIELD",
      payload: { stepId, fieldId: field.id, changes, parentPath },
    });
  }

  function handleToggleEndpoint(checked: boolean) {
    setUseEndpoint(checked);
    if (checked) {
      update({
        endpoint: {
          url: "",
          responsePath: "data.items",
          valuePath: "name",
          searchParam: "search",
        },
        options: undefined,
      });
    } else {
      update({ endpoint: undefined, options: ["Option 1", "Option 2"] });
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground">
        Options Source
      </h4>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Use API Endpoint</Label>
        <Switch checked={useEndpoint} onCheckedChange={handleToggleEndpoint} />
      </div>

      {useEndpoint ? (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label className="text-xs">URL</Label>
            <Input
              value={field.endpoint?.url ?? ""}
              onChange={(e) =>
                update({
                  endpoint: { ...field.endpoint!, url: e.target.value },
                })
              }
              className="h-8 text-sm font-mono"
              placeholder="/api/items"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Response Path</Label>
            <Input
              value={field.endpoint?.responsePath ?? ""}
              onChange={(e) =>
                update({
                  endpoint: {
                    ...field.endpoint!,
                    responsePath: e.target.value,
                  },
                })
              }
              className="h-8 text-sm font-mono"
              placeholder="data.items"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Value Path</Label>
            <Input
              value={field.endpoint?.valuePath ?? ""}
              onChange={(e) =>
                update({
                  endpoint: { ...field.endpoint!, valuePath: e.target.value },
                })
              }
              className="h-8 text-sm font-mono"
              placeholder="name"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Search Param</Label>
            <Input
              value={field.endpoint?.searchParam ?? ""}
              onChange={(e) =>
                update({
                  endpoint: {
                    ...field.endpoint!,
                    searchParam: e.target.value || undefined,
                  },
                })
              }
              className="h-8 text-sm font-mono"
              placeholder="search"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Infinite Scroll</Label>
            <Switch
              checked={field.endpoint?.infiniteScroll ?? false}
              onCheckedChange={(checked) =>
                update({
                  endpoint: { ...field.endpoint!, infiniteScroll: checked },
                })
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-xs">Options</Label>
          {(field.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Input
                value={opt}
                onChange={(e) => {
                  const newOptions = [...(field.options ?? [])];
                  newOptions[i] = e.target.value;
                  update({ options: newOptions });
                }}
                className="h-8 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const newOptions = (field.options ?? []).filter(
                    (_, j) => j !== i
                  );
                  update({ options: newOptions });
                }}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              update({
                options: [
                  ...(field.options ?? []),
                  `Option ${(field.options?.length ?? 0) + 1}`,
                ],
              })
            }
            className="w-full"
          >
            <PlusIcon className="size-3.5" />
            Add Option
          </Button>
        </div>
      )}
    </div>
  );
}
