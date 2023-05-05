export interface GisViewerProps {
  /**
   * A unique identifier for a particular instance. This ID must be unique
   * across an instance, otherwise, subscribing to the same store with the
   * same ID will lead to unexpected behavior.
   */
  id: string;
}

export function GisViewer({ id }: GisViewerProps) {
  console.log({ id });

  return null;
}
