import { isEmpty } from "lodash";
import { Context, useContext } from "react";

export function useRequiredContext<T>(contextObj: Context<T>, name: string) {
  const context = useContext(contextObj);
  if (isEmpty(context)) throw new Error(`Component has no access to ${name}.`);
  return context;
}
