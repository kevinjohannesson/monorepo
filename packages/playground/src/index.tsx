import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";
import "gis-viewer/style/dist/index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./root";
import { ErrorView } from "./error-view";
import { GisViewerOsmSingleTileView } from "./experiments/gis-viewer-osm-single-tile-view";
import { GisViewerTiledView } from "./experiments/gis-viewer-osm-tiled-view";
import { GisViewerOsmSingleVsTiledView } from "./experiments/gis-viewer-osm-single-vs-tiled-view";
import { GisViewerLargeScreenView } from "./experiments/gis-viewer-large-screen";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorView />,
    children: [
      {
        path: "/",
        element: <GisViewerLargeScreenView />,
      },
      {
        path: "experiments/osm-single-tile",
        element: <GisViewerOsmSingleTileView />,
      },
      {
        path: "experiments/osm-tiled",
        element: <GisViewerTiledView />,
      },
      {
        path: "experiments/osm-single-vs-tiled",
        element: <GisViewerOsmSingleVsTiledView />,
      },
      {
        path: "experiments/osm-large-screen",
        element: <GisViewerLargeScreenView />,
      },
    ],
  },
]);
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Root />,
//     errorElement: <ErrorView />,
//     children: [
//       {
//         path: "experiments/osm-single-tile",
//         element: <GisViewerOsmSingleTileView />,
//       },
//       {
//         path: "experiments/osm-tiled",
//         element: <GisViewerTiledView />,
//       },
//       {
//         path: "experiments/osm-single-vs-tiled",
//         element: <GisViewerOsmSingleVsTiledView />,
//       },
//       {
//         path: "experiments/osm-large-screen",
//         element: <GisViewerLargeScreenView />,
//       },
//     ],
//   },
// ]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
