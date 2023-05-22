export function calculateNextPowerOf2(x: number): number {
  // https://stackoverflow.com/questions/466204/rounding-up-to-next-power-of-2
  return 1 << Math.ceil(Math.log2(x));
}

export function calculatePreviousPowerOf2(x: number): number {
  return 1 << Math.floor(Math.log2(x));
}

export function calculateClosestPowerOf2(x: number): number {
  const nextPowerOf2 = calculateNextPowerOf2(x);
  const prevPowerOf2 = calculatePreviousPowerOf2(x);

  const distanceToNext = Math.abs(nextPowerOf2 - x);
  const distanceToPrev = Math.abs(prevPowerOf2 - x);

  return distanceToNext < distanceToPrev ? nextPowerOf2 : prevPowerOf2;
}
