import { Outlet, Link } from "react-router-dom";

import "./app.css";
import { createSpiralPattern } from "utils/src/pattern";

type Vector2d = [number, number];

interface ArrayComparatorProps {
  original: Vector2d[];
  filtered: Vector2d[];
}

const ArrayComparator: React.FC<ArrayComparatorProps> = ({
  original,
  filtered,
}) => {
  return (
    <div className="array-comparator">
      <div className="column">
        {original.map((item, index) => (
          <div key={index} className="row">
            {item[0]}, {item[1]}
          </div>
        ))}
      </div>
      <div className="column">
        {original.map((item, index) => (
          <div key={index} className="row">
            {filtered.some((v) => v[0] === item[0] && v[1] === item[1])
              ? `${item[0]}, ${item[1]}`
              : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

interface SpiralVisualizerProps {
  original: Vector2d[];
  filtered: Vector2d[];
}

const SpiralVisualizer: React.FC<SpiralVisualizerProps> = ({
  original,
  filtered,
}) => {
  const center = 250; // Half of the wrapper size

  return (
    <div className="spiral-visualizer">
      {original.map((item, index) => (
        <div
          key={index}
          className="coordinate"
          style={{
            left: `${center + item[0] * 50 - 25}px`,
            top: `${center - item[1] * 50 - 25}px`,
            borderColor: filtered.some(
              (v) => v[0] === item[0] && v[1] === item[1]
            )
              ? "black"
              : "red",
          }}
        >
          {item[0]}, {item[1]}
        </div>
      ))}
    </div>
  );
};

export function Root() {
  // const w = 4,
  //   h = 3;
  // const filtered = createSpiralPattern(w, h);
  // // const filtered = createSpiralPattern2(size).filter(
  // //   ([x, y]) =>
  // //     y > Math.floor(-h / 2) &&
  // //     y <= Math.floor(h / 2) &&
  // //     x > Math.floor(-w / 2) &&
  // //     x <= Math.floor(w / 2)
  // // );

  // const original = createSpiralPattern(w);

  // console.log({ original });
  // // const filtered = original;

  // console.log(filtered);
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
        {/* <ArrayComparator original={arr1} filtered={arr2} /> */}
        {/* <SpiralVisualizer original={original} filtered={filtered} /> */}
      </div>
    </>
  );
}
