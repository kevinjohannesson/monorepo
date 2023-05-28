import { store } from "gis-viewer/src/gis-viewer";
import "gis-viewer/style/dist/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorView } from "./error-view";
import { GisViewerGenericSlippyMapView } from "./experiments/gis-viewer-generic-slippy-map";
import { MasterSlaveFeature } from "./features/master-slave";
import { StaticSlippyMapFeature } from "./features/static-slippy-map";
// import "./index.css";
import { Root } from "./root";
import "./style/index.scss";
import { NavigationControlsFeature } from "./features/navigation-controls";
import { MouseInteractionsFeature } from "./features/mouse-interactions";
import { MapInfoItemsFeature } from "./features/map-info-items";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorView />,
    children: [
      {
        path: "/",
        element: <StaticSlippyMapFeature />,
      },
      {
        path: "features/static-slippy-map",
        element: <StaticSlippyMapFeature />,
      },
      {
        path: "features/navigation-controls",
        element: <NavigationControlsFeature />,
      },
      {
        path: "features/mouse-interactions",
        element: <MouseInteractionsFeature />,
      },
      {
        path: "features/map-info-items",
        element: <MapInfoItemsFeature />,
      },
      {
        path: "features/master-slave",
        element: <MasterSlaveFeature />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
