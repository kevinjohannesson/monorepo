import { type ReactElement, type ReactNode, useEffect } from "react";
import { addGisViewer, removeGisViewer, selectGisViewerInstanceIsAvailable } from "../../slice";
import { useDispatch, useSelector } from "react-redux";
import { useMetadataContext } from "../../meta-data";

export function GisViewerInstanceManager(): null {
  const { id } = useMetadataContext();

  const isAvailable = useSelector(selectGisViewerInstanceIsAvailable(id));

  const dispatch = useDispatch();

  // Adding the GIS viewer
  useEffect(() => {
    if (!isAvailable) {
      dispatch(addGisViewer({ id }));
    }
  }, [dispatch, id, isAvailable]);

  // Removing the GIS viewer
  useEffect(() => {
    return () => {
      dispatch(removeGisViewer({ id }));
    };
  }, [dispatch, id]);

  return null;
}

interface InstanceProps {
  children?: ReactNode;
}

export function GisViewerInstance({ children = null }: InstanceProps): ReactElement {
  const { id } = useMetadataContext();

  const isAvailable = useSelector(selectGisViewerInstanceIsAvailable(id));

  return (
    <>
      <GisViewerInstanceManager />
      {isAvailable ? children : null}
    </>
  );
}
