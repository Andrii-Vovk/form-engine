export function EmptyStepPlaceholder() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
      <p className="text-sm text-muted-foreground">
        Click a field from the palette to add it here
      </p>
    </div>
  );
}
