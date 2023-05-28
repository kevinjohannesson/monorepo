import { type Vector2d, calculateNextPowerOf2 } from "utils";

export class SlippyMap {
  readonly dimensions: Vector2d;
  readonly tileSize: number;

  constructor(dimensions: Vector2d, tileSize: number) {
    this.dimensions = dimensions;
    this.tileSize = tileSize;
  }

  static calculateTilesPerAxis(zoomLevel: number): number {
    return Math.pow(2, zoomLevel);
  }

  static calculateMaxTileNumber(zoomLevel: number): number {
    return SlippyMap.calculateTilesPerAxis(zoomLevel) - 1;
  }

  static calculateTiles(zoomLevel: number): number {
    return Math.pow(SlippyMap.calculateTilesPerAxis(zoomLevel), 2);
  }

  private get tileCountToCoverGrid(): number {
    return calculateNextPowerOf2(Math.ceil(this.dimensions[0] / this.tileSize));
  }

  public get zoomLevelToCoverGrid(): number {
    return Math.log2(this.tileCountToCoverGrid);
  }
}
