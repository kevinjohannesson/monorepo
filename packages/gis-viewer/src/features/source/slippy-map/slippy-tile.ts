import { assertNotNull } from "utils";
import { useEffect } from "react";
import { useLayerContext } from "../../layer";

// const GridTileCoordinate = "GridTileCoordinate";
// const LatLonCoordinate = "LatLonCoordinate";

// class GridCoordinateParams {
//   readonly type = GridTileCoordinate;

//   x: number;
//   y: number;
//   z: number;

//   constructor(x: number, y: number, z: number) {
//     if (!Number.isInteger(z)) {
//       throw new Error("'z' must be an integer");
//     }

//     this.x = x;
//     this.y = y;
//     this.z = z;
//   }
// }

// class LatLonCoordinateParams {
//   readonly type = "LatLonCoordinate";

//   latitude: number;
//   longitude: number;
//   zoomLevel: number;

//   constructor(latitude: number, longitude: number, zoomLevel: number) {
//     // lat lon value check here

//     this.latitude = latitude;
//     this.longitude = longitude;
//     this.zoomLevel = zoomLevel;
//   }
// }

// type SlippyTileParams = LatLonCoordinateParams | GridCoordinateParams;

// function isLatLonParams(params: SlippyTileParams): params is LatLonCoordinateParams {
//   return (params as LatLonCoordinateParams)?.type === LatLonCoordinate;
// }

// export class SlippyTile {
//   public position: Vector2d;
//   public zoomLevel: number;

//   constructor(params: SlippyTileParams) {
//     if (isLatLonParams(params)) {
//       const { latitude, longitude, zoomLevel } = params;

//       this.position = SlippyTile.calculatePosition(latitude, longitude, zoomLevel);
//       this.zoomLevel = zoomLevel;
//     }
//     // Implement other parameter types...
//     else {
//       throw new Error("Invalid parameters");
//     }
//   }

//   public get tileNumbers(): Vector2d {
//     return SlippyTile.toTileNumbers(this.position);
//   }

//   public static toTileNumbers(tilePosition: Vector2d): Vector2d {
//     return tilePosition.map(Math.floor) as Vector2d;
//   }

//   private static calculatePositionX(longitude: number, tilesPerAxis: number): number {
//     return tilesPerAxis * ((longitude + 180) / 360);
//   }

//   private static calculatePositionY(latitude: number, tilesPerAxis: number): number {
//     return (
//       (tilesPerAxis *
//         (1 - Math.log(Math.tan(deg2rad(latitude)) + 1 / Math.cos(deg2rad(latitude))) / Math.PI)) /
//       2
//     );
//   }

//   private static calculatePosition(
//     latitude: number,
//     longitude: number,
//     zoomLevel: number,
//   ): Vector2d {
//     const tilesPerAxis = SlippyMap.calculateTilesPerAxis(zoomLevel);
//     return [
//       SlippyTile.calculatePositionX(longitude, tilesPerAxis),
//       SlippyTile.calculatePositionY(latitude, tilesPerAxis),
//     ] as Vector2d;
//   }

//   // perhaps this could be removed in favour of the smaller single method?
//   public calculateTileNumbersAtHigherZoomLevel(zoomLevelsToIncrease = 1): Vector2d {
//     const higherZoomLevelOffsetX = this.position[0] - this.tileNumbers[0] >= 0.5 ? 1 : 0;
//     const higherZoomLevelOffsetY = this.position[1] - this.tileNumbers[1] >= 0.5 ? 1 : 0;

//     let [tileNumbersAtHigherZoomX, tileNumbersAtHigherZoomY] = this.tileNumbers;

//     for (let i = 0; i < zoomLevelsToIncrease; i++) {
//       tileNumbersAtHigherZoomX = tileNumbersAtHigherZoomX * 2 + higherZoomLevelOffsetX;
//       tileNumbersAtHigherZoomY = tileNumbersAtHigherZoomY * 2 + higherZoomLevelOffsetY;
//     }

//     return [tileNumbersAtHigherZoomX, tileNumbersAtHigherZoomY] as Vector2d;
//   }

//   // perhaps this could be removed in favour of the smaller single method?
//   public calculateTileNumbersAtLowerZoomLevel(levelsToDecrease = 1): Vector2d {
//     let tileNumbersAtLowerZoomX = this.tileNumbers[0];
//     let tileNumbersAtLowerZoomY = this.tileNumbers[1];

//     for (let i = 0; i < levelsToDecrease; i++) {
//       tileNumbersAtLowerZoomX = Math.floor(tileNumbersAtLowerZoomX / 2);
//       tileNumbersAtLowerZoomY = Math.floor(tileNumbersAtLowerZoomY / 2);
//     }

//     return [tileNumbersAtLowerZoomX, tileNumbersAtLowerZoomY] as Vector2d;
//   }

//   public calculatePositionAtZoomLevel(targetZoomLevel: number): Vector2d {
//     if (!Number.isInteger(targetZoomLevel)) {
//       throw new Error("'targetZoomLevel' must be an integer");
//     }
//     return multiplyVector2d(this.position, 2 ** (Math.floor(targetZoomLevel) - this.zoomLevel));
//   }

//   public calculateTileNumbersAtZoomLevel(targetZoomLevel: number): Vector2d {
//     return SlippyTile.toTileNumbers(this.calculatePositionAtZoomLevel(targetZoomLevel));
//   }
// }

export function SlippyMapTile(): null {
  const layer = useLayerContext();

  useEffect(() => {
    const ctx = layer.ref.current?.getContext("2d");
    assertNotNull(ctx);

    ctx.strokeRect(100, 100, 100, 100);
  });
  return null;
}
