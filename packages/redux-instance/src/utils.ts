/**
 * Adds a name prefix to the provided id, ensuring uniqueness across different instance slices.
 * The resulting id has the format: "{name}/{id}"
 */
export function prefixIdWithName(name: string, id: string) {
  return `${name}/${id}`;
}
