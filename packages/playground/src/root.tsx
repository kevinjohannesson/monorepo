import { Outlet, Link } from "react-router-dom";

export function Root() {
  return (
    <>
      <div id="sidebar">
        <h1>Playground</h1>
        {/* <div>
          <form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
            />
            <div id="search-spinner" aria-hidden hidden={true} />
            <div className="sr-only" aria-live="polite"></div>
          </form>
          <form method="post">
            <button type="submit">New</button>
          </form>
        </div> */}
        <nav>
          <ul>
            <li>
              <Link to={`experiments/osm-single-tile`}>OSM Single Tile</Link>
            </li>
            <li>
              <Link to={`experiments/osm-tiled`}>OSM Tiled</Link>
            </li>
            <li>
              <Link to={`experiments/osm-single-vs-tiled`}>
                OSM Single vs Tiled
              </Link>
            </li>
            <li>
              <Link to={`experiments/osm-large-screen`}>OSM Large Screen</Link>
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
