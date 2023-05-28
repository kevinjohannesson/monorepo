import { Attribution } from "gis-viewer/src/features/map-info/attribution";
import { Link } from "react-router-dom";

export function StamenAttribution({
  license = "CC_BY_SA",
}: {
  license?: "ODbL" | "CC_BY_SA";
}) {
  return (
    <Attribution>
      Map tiles by{" "}
      <Link
        to="http://stamen.com"
        reloadDocument
        target="_blank"
        rel="noreferrer"
      >
        Stamen Design
      </Link>
      , under{" "}
      <Link
        to="http://creativecommons.org/licenses/by/3.0"
        reloadDocument
        target="_blank"
        rel="noreferrer"
      >
        CC BY 3.0
      </Link>
      . Data by{" "}
      <Link
        to="http://openstreetmap.org"
        reloadDocument
        target="_blank"
        rel="noreferrer"
      >
        OpenStreetMap
      </Link>
      , under{" "}
      {license === "ODbL" ? (
        <Link
          to="http://www.openstreetmap.org/copyright"
          reloadDocument
          target="_blank"
          rel="noreferrer"
        >
          ODbL
        </Link>
      ) : (
        <Link
          to="http://creativecommons.org/licenses/by-sa/3.0"
          reloadDocument
          target="_blank"
          rel="noreferrer"
        >
          CC BY SA
        </Link>
      )}
      .
    </Attribution>
  );
}
