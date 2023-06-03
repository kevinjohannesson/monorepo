import { store } from "gis-viewer/src/store";
import "gis-viewer/style/dist/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorView } from "./error-view";
import { MasterSlaveFeature } from "./features/master-slave";
import { StaticSlippyMapFeature } from "./features/static-slippy-map";
import { Root } from "./root";
import "./style/index.scss";
import { NavigationControlsFeature } from "./features/navigation-controls";
import { MouseInteractionsFeature } from "./features/mouse-interactions";
import { MapInfoItemsFeature } from "./features/map-info-items";
import { MapFeaturesFeature } from "./features/map-features";

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
        path: "features/map-features",
        element: <MapFeaturesFeature />,
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
