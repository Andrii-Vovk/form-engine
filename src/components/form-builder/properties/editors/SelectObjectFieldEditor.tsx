import { PlusIcon, XIcon } from "lucide-react";
import type { SelectObjectField } from "@/types/form-schema";
import { useFormBuilder } from "../../FormBuilderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface Props {
  field: SelectObjectField;
  stepId: string;
  parentPath?: { parentFieldId: string; branchKey?: string };
}

export function SelectObjectFieldEditor({ field, stepId, parentPath }: Props) {
  const { dispatch } = useFormBuilder();
  const [useEndpoint, setUseEndpoint] = useState(!!field.endpoint);

  function update(changes: Partial<SelectObjectField>) {
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
          idPath: "id",
          labelPath: "name",
          searchParam: "search",
        },
        options: undefined,
      });
    } else {
      update({
        endpoint: undefined,
        options: [{ id: "opt1", label: "Option 1" }],
      });
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
                update({ endpoint: { ...field.endpoint!, url: e.target.value } })
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
                  endpoint: { ...field.endpoint!, responsePath: e.target.value },
                })
              }
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">ID Path</Label>
              <Input
                value={field.endpoint?.idPath ?? ""}
                onChange={(e) =>
                  update({
                    endpoint: { ...field.endpoint!, idPath: e.target.value },
                  })
                }
                className="h-8 text-sm font-mono"
                placeholder="id"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Label Path</Label>
              <Input
                value={field.endpoint?.labelPath ?? ""}
                onChange={(e) =>
                  update({
                    endpoint: { ...field.endpoint!, labelPath: e.target.value },
                  })
                }
                className="h-8 text-sm font-mono"
                placeholder="name"
              />
            </div>
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
                value={opt.id}
                onChange={(e) => {
                  const newOptions = [...(field.options ?? [])];
                  newOptions[i] = { ...opt, id: e.target.value };
                  update({ options: newOptions });
                }}
                className="h-8 text-sm"
                placeholder="id"
              />
              <Input
                value={opt.label}
                onChange={(e) => {
                  const newOptions = [...(field.options ?? [])];
                  newOptions[i] = { ...opt, label: e.target.value };
                  update({ options: newOptions });
                }}
                className="h-8 text-sm"
                placeholder="label"
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
                  {
                    id: `opt${(field.options?.length ?? 0) + 1}`,
                    label: `Option ${(field.options?.length ?? 0) + 1}`,
                  },
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
