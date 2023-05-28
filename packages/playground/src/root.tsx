import { Outlet, Link } from "react-router-dom";

export function Root() {
  return (
    <>
      <div id="sidebar">
        <nav>
          <ul>
            <li className="tooltip right">
              <Link to={`features/static-slippy-map`}>Slippy-Map</Link>
              <div className="tooltip-content flex flex-col">
                <span>Static slippy-tile map with tilenumbers.</span>
                <span className="text-sm">
                  Map has no interaction whatsoever.
                </span>
              </div>
            </li>

            <li className="tooltip right">
              <Link to={`features/navigation-controls`}>
                Navigation controls
              </Link>
              <div className="tooltip-content flex flex-col">
                <span>
                  Slippy-tile map with navigation controls to zoom and pan.
                </span>
              </div>
            </li>

            <li className="tooltip right">
              <Link to={`features/mouse-interactions`}>Mouse interactions</Link>
              <div className="tooltip-content flex flex-col">
                <span>
                  Slippy-tile map with mouse cursor interactions to zoom and
                  pan.
                </span>
                <span className="text-sm">
                  Click and drag: Translate the map.
                </span>
                <span className="text-sm">Scroll: Zoom in or out.</span>
              </div>
            </li>

            <li className="tooltip right">
              <Link to={`features/map-info-items`}>Mouse info items</Link>
              <div className="tooltip-content flex flex-col">
                <span>Map with info-items relating to the current view.</span>
                <span className="text-sm">
                  Displaying view center coordinates, zoomlevel, cursor
                  coordinates.
                </span>
              </div>
            </li>

            <li className="tooltip right">
              <Link to={`features/master-slave`}>Master-Slave</Link>
              <div className="tooltip-content flex flex-col">
                <span>Slippy-tile in master-slave setup.</span>
                <span className="text-sm">
                  Master: Allows interaction with mouse cursor.
                </span>
                <span className="text-sm">
                  Slave: Follows changes made to master viewer.
                </span>
              </div>
            </li>
          </ul>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
