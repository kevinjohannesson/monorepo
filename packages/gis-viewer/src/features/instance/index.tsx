import { ReactNode, useEffect } from "react";
import {
  selectGisViewerInstanceIsAvailable,
  useGisViewerInstanceSelector,
  useGisViewerSelector,
} from "../../slice";
import { useSelector } from "react-redux";

interface InstanceRendererProps {
  children?: ReactNode;
}

export function Instance({ children }: InstanceRendererProps) {
  // const isAvailable = useSelector(
  //   selectGisViewerInstanceIsAvailable("default")
  // );
  // const isInstanceAvailable = (selectIsInstanceAvailable(id));

  return <>{children}</>;
}

// function InstanceInitializer() {
//   const { id } = useMetaDataContext();

//   const dispatch = useRootDispatch();

//   const isInstanceAvailable = useRootSelector(selectIsInstanceAvailable(id));

//   useEffect(() => {
//     if (!isInstanceAvailable) {
//       dispatch(addInstance({ id }));
//     }

//     return () => {
//       dispatch(removeInstance({ id }));
//     };
//   }, [dispatch, id, isInstanceAvailable]);

//   return null;
// }

// interface InstanceRendererProps {
//   children?: ReactNode;
// }

// function InstanceRenderer({ children = null }: InstanceProps) {
//   const { id } = useMetaDataContext();

//   const instanceIsAvailable = useRootSelector(selectIsInstanceAvailable(id));

//   if (instanceIsAvailable) return <>{children}</>;
//   else return null;
// }

// interface InstanceProps extends InstanceRendererProps {
//   //
// }

// export function Instance({ children = null }: InstanceProps) {
//   return (
//     <>
//       <InstanceInitializer />
//       <InstanceRenderer>{children}</InstanceRenderer>
//     </>
//   );
// }
