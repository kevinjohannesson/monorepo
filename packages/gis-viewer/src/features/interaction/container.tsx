import { Fragment, type ReactElement, type ReactNode } from "react";

export interface InteractionContainerProps {
  children: ReactNode;
}

export function InteractionContainer({ children }: InteractionContainerProps): ReactElement {
  return <Fragment>{children}</Fragment>;
}
// export const InteractionContainer = forwardRef<HTMLDivElement, InteractionContainerProps>(
//   ({ children }, ref) => {
//     return (
//       <div ref={ref} className="w-full h-full absolute top-0 left-0">
//         {children}
//       </div>
//     );
//   },
// );

InteractionContainer.displayName = "InteractionContainer";
