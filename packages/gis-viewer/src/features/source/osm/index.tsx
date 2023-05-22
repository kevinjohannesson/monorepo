import { type Coordinate } from "../../../types";
import { OsmTileImageFetcher } from "./osm-tile-image-fetcher";
import { OsmTileRenderer } from "./osm-tile-renderer";
import { type ReactElement, useEffect } from "react";
import { TileGridProvider } from "../../tile-grid";
import { TileImageCacheProvider as TileImageCacheProviderNew } from "../../cache/tile-image-cache";
import { type UrlParameters } from "./types";
import { type Vector2d, addVector2d, assertNotNull, multiplyVector2d } from "utils";
import {
  calculateFractionalTileNumbers,
  calculateOsmZoomBaseLevel2,
  calculateTileNumbers,
  calculateTotalTilesPerAxisAtZoomLevel,
  calculateWrappedTileNumberX,
} from "./utils/tile-number-utils";
import { calculateRenderedTileCenterOffset } from "./utils/rendered-tile-utils";
import { isValidOsmUrlParameters } from "./utils/url-parameters-utils";
import { selectViewState, selectZoomLevel } from "../../view/slice";
import { useGisViewerSelector } from "../../../slice";
import { useLayerContext } from "../../layer";
import { useOsmBaseTileSize } from "./hooks/use-osm-base-tile-size";
import { useTileImageCacheContext } from "../../cache";
import { useViewDimensions } from "../../view/hooks/use-view-state";

const TILE_SERVER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const loadAndCacheTileImage = async (
  urlParameters: UrlParameters,
  getCache: (zoomLevel: number, xIndex: number, yIndex: number) => HTMLImageElement | null,
  setCache: (image: HTMLImageElement, zoomLevel: number, xIndex: number, yIndex: number) => void,
): Promise<HTMLImageElement> => {
  return await new Promise<HTMLImageElement>((resolve) => {
    const cachedImage = getCache(urlParameters.z, urlParameters.x, urlParameters.y);

    if (cachedImage != null) {
      resolve(cachedImage);
    } else {
      const tileUrl = TILE_SERVER_URL.replace("{z}", urlParameters.z.toString())
        .replace("{x}", urlParameters.x.toString())
        .replace("{y}", urlParameters.y.toString());

      const tileImage = new Image();

      tileImage.onload = function () {
        setCache(tileImage, urlParameters.z, urlParameters.x, urlParameters.y);
        resolve(tileImage);
      };

      tileImage.src = tileUrl;
    }
  });
};

export interface TileRendererProps {
  topLeftPixelCoordinate: Coordinate;
  urlParameters: UrlParameters;
  renderedTileSize: number;
}

export function TileRenderer({
  topLeftPixelCoordinate,
  urlParameters,
  renderedTileSize,
}: TileRendererProps): null {
  const { ref } = useLayerContext();
  const { getCache, setCache } = useTileImageCacheContext();
  // const imageRef = useRef<HTMLImageElement>(new Image());
  useEffect(() => {
    const canvas = ref.current;
    assertNotNull(canvas);
    const context = canvas.getContext("2d");
    assertNotNull(context);

    const cachedImage = getCache(urlParameters.z, urlParameters.x, urlParameters.y);

    const tileUrl = TILE_SERVER_URL.replace("{z}", urlParameters.z.toString())
      .replace("{x}", urlParameters.x.toString())
      .replace("{y}", urlParameters.y.toString());

    // const handleAsync = async (): Promise<void> => {
    const image = new Image();

    if (cachedImage != null) {
      // console.log("drawing image from cache");
      // console.table({ urlParameters });
      // console.table({ topLeftPixelCoordinate });
      context.drawImage(
        // imageRef.current,
        cachedImage,
        topLeftPixelCoordinate[0],
        topLeftPixelCoordinate[1],
        renderedTileSize,
        renderedTileSize,
      );
    } else {
      image.onload = function () {
        setCache(image, urlParameters.z, urlParameters.x, urlParameters.y);

        // context.imageSmoothingEnabled = false;
        // console.table({ urlParameters });
        // console.table({ topLeftPixelCoordinate });

        context.drawImage(
          // imageRef.current,
          image,
          topLeftPixelCoordinate[0],
          topLeftPixelCoordinate[1],
          renderedTileSize,
          renderedTileSize,
        );
      };

      image.src = tileUrl;
    }

    // const tileUrl = TILE_SERVER_URL.replace("{z}", urlParameters.z.toString())
    //   .replace("{x}", urlParameters.x.toString())
    //   .replace("{y}", urlParameters.y.toString());
    // image.onload = function () {
    //   // imageRef.current =  loadAndCacheTileImage(
    //   //   urlParameters,
    //   //   getCache,
    //   //   setCache,
    //   // ).then(

    //   // );
    //   const context = canvas.getContext("2d");
    //   assertNotNull(context);

    //   // context.imageSmoothingEnabled = false;
    //   console.log({ urlParameters });
    //   context.drawImage(
    //     // imageRef.current,
    //     image,
    //     topLeftPixelCoordinate[0],
    //     topLeftPixelCoordinate[1],
    //     renderedTileSize,
    //     renderedTileSize,
    //   );
    //   // };
    // };

    // handleAsync();
    image.src = tileUrl;

    return () => {
      image.onload = null;
      // imageRef.current.onload = null;
    };
  }, [ref, urlParameters, topLeftPixelCoordinate, renderedTileSize]);

  return null;
}

interface TileClearerProps extends Omit<TileRendererProps, "urlParameters"> {}

function TileClearer({ topLeftPixelCoordinate, renderedTileSize }: TileClearerProps): null {
  const { ref } = useLayerContext();

  useEffect(() => {
    const canvas = ref.current;
    assertNotNull(canvas);
    const context = canvas.getContext("2d");
    assertNotNull(context);

    context.clearRect(
      topLeftPixelCoordinate[0],
      topLeftPixelCoordinate[1],
      renderedTileSize,
      renderedTileSize,
    );
  });

  return null;
}

interface ValidTileRendererProps
  extends Omit<TileRendererProps, "urlParameters">,
    TileClearerProps {
  tileNumbers: Coordinate;
  zoomLevel: number;
  isWrapped: boolean;
}

function ValidTileRenderer({
  tileNumbers: [tileX, tileY],
  zoomLevel,
  isWrapped,
  topLeftPixelCoordinate,
  renderedTileSize,
}: ValidTileRendererProps): ReactElement {
  const x = isWrapped ? calculateWrappedTileNumberX(tileX, zoomLevel) : tileX;
  const y = tileY;

  const urlParameters: UrlParameters = {
    z: zoomLevel,
    x,
    y,
  };

  if (isValidOsmUrlParameters(urlParameters)) {
    return (
      <TileRenderer
        topLeftPixelCoordinate={topLeftPixelCoordinate}
        renderedTileSize={renderedTileSize}
        urlParameters={urlParameters}
      />
    );
  }

  return (
    <TileClearer
      topLeftPixelCoordinate={topLeftPixelCoordinate}
      renderedTileSize={renderedTileSize}
    />
  );
}

const tileOffsets: Vector2d[] = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, 1],
  [-1, 1],
  [1, -1],
];

const epsilon = 1e-6;

export function OsmSourceOLD(): ReactElement {
  const [width, height] = useGisViewerSelector(selectViewState("dimensions"));
  const projection = useGisViewerSelector(selectViewState("projection"));
  const centerCoordinate = useGisViewerSelector(selectViewState("centerCoordinate"));
  const isWrappedX = useGisViewerSelector(selectViewState("wrapping")).isWrappedX;

  const zoomLevel = useGisViewerSelector(selectZoomLevel);
  const initialIntegerZoomLevel = Math.floor(zoomLevel + epsilon);
  const fractionalZoom = zoomLevel - initialIntegerZoomLevel;
  const scale = 1 + fractionalZoom;

  // const renderedTileSize = Math.max(width, height) * scale;
  // const renderedTileSize = 256 * scale;

  // console.log("new update");
  // calculate how many tiles (256px) fit in 1 view (math.max(width, height)) at view zoom level 0
  // calculate osm zoom level with enough tiles to fit the view, this is now the OSM offset
  // e.g. view = [600,300], needed tiles: ~2.4 => 4 => zoom level with 4 tiles for whole world: 2
  // now we can calculate osm tile z value by using the view zoom level and the OSM offset

  const osmBaseZoomLevel = calculateOsmZoomBaseLevel2(width);
  // console.log({ osmBaseZoomLevel });
  const integerZoomLevel = initialIntegerZoomLevel + osmBaseZoomLevel;
  // console.log({ integerZoomLevel });
  // console.log(calculateTotalTilesPerAxisAtZoomLevel(integerZoomLevel));
  // console.log(calculateTotalTilesPerAxisAtZoomLevel(integerZoomLevel) * 256);
  // console.log(
  //   (calculateTotalTilesPerAxisAtZoomLevel(integerZoomLevel) * 256) /
  //     Math.max(width, height),
  // );
  const n =
    (calculateTotalTilesPerAxisAtZoomLevel(osmBaseZoomLevel) * 256) / Math.max(width, height);
  const renderedTileSize = (256 / n) * scale;

  // console.log({ n });
  // console.log({ renderedTileSize });
  // const tileNumbersAtNewZoomLevel = calculateTileNumbers(
  //   centerCoordinate,
  //   projection.code,
  //   integerZoomLevel + osmBaseZoomLevel,
  // );

  const tileNumbers = calculateTileNumbers(centerCoordinate, projection.code, integerZoomLevel);

  // console.log({ tileNumbers });
  // console.log({ tileNumbersAtNewZoomLevel });

  const fractionalTileNumbers = calculateFractionalTileNumbers(
    centerCoordinate,
    projection.code,
    integerZoomLevel,
  );

  const centered: Coordinate = [
    width / 2 - renderedTileSize / 2,
    height / 2 - renderedTileSize / 2,
  ];

  const renderedCenterOffset = calculateRenderedTileCenterOffset(
    renderedTileSize,
    fractionalTileNumbers,
    tileNumbers,
  );

  const topLeftPixelCoordinate = addVector2d(centered, renderedCenterOffset);

  console.log({ topLeftPixelCoordinate });
  return (
    <>
      {tileOffsets.map((offset) => (
        <ValidTileRenderer
          key={offset.join()}
          tileNumbers={addVector2d(tileNumbers, offset)}
          zoomLevel={integerZoomLevel}
          isWrapped={isWrappedX}
          renderedTileSize={renderedTileSize}
          topLeftPixelCoordinate={addVector2d(
            topLeftPixelCoordinate,
            multiplyVector2d(offset, renderedTileSize),
          )}
        />
      ))}
    </>
  );
}

/// NEW

export function OsmSource(): ReactElement {
  const viewDimensions = useViewDimensions();
  const osmBaseTileSize = useOsmBaseTileSize();

  return (
    <TileGridProvider gridDimensions={viewDimensions} tileDimensions={osmBaseTileSize}>
      <TileImageCacheProviderNew>
        <OsmTileImageFetcher />
        <OsmTileRenderer />
      </TileImageCacheProviderNew>
    </TileGridProvider>
  );
}
