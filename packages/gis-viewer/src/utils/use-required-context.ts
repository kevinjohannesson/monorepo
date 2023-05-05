import { isEmpty } from "lodash";
import { Context, useContext } from "react";

export function useRequiredContext<T>(_context: Context<T>) {
  const context = useContext(_context);
  if (isEmpty(context))
    throw new Error(`Component has no access to ${_context.displayName}.`);
  return context;
}
