export function generateId(prefix?: string): string {
  const id = crypto.randomUUID().slice(0, 8);
  return prefix ? `${prefix}_${id}` : id;
}
