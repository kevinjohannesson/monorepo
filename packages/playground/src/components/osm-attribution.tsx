import { Attribution } from "gis-viewer/src/features/map-info/attribution";
import { Link } from "react-router-dom";

export function OsmAttribution() {
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
