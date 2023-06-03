import { Attribution } from "gis-viewer/src/features/map-info/attribution";
import { Link } from "react-router-dom";
import { type ReactElement } from "react";

export function OsmAttribution(): ReactElement {
  return (
    <Attribution>
      <Link
        to="https://www.openstreetmap.org/copyright"
        reloadDocument
        target="_blank"
        rel="noreferrer"
      >
        © OpenStreetMap
      </Link>{" "}
      contributors
    </Attribution>
  );
}
