const EARTH_RADIUS_METERS = 6371008.8;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculatePolygonSurfaceHectares(
  points: { longitude: number; latitude: number }[],
) {
  if (points.length < 3) return 0;

  const lat0 = toRadians(
    points.reduce((sum, point) => sum + point.latitude, 0) / points.length,
  );

  const projected = points.map((point) => {
    const x = EARTH_RADIUS_METERS * toRadians(point.longitude) * Math.cos(lat0);
    const y = EARTH_RADIUS_METERS * toRadians(point.latitude);
    return { x, y };
  });

  let shoelace = 0;
  for (let i = 0; i < projected.length; i += 1) {
    const current = projected[i];
    const next = projected[(i + 1) % projected.length];
    shoelace += current.x * next.y - next.x * current.y;
  }

  const areaSquareMeters = Math.abs(shoelace) / 2;
  return areaSquareMeters / 10000;
}
