import { senegalRegions, type SenegalRegion } from "@/data/senegal-regions";

/**
 * Ray-casting point-in-polygon test.
 * Returns true if the point (lng, lat) lies inside the given polygon ring.
 */
export function pointInPolygon(
  lng: number,
  lat: number,
  ring: number[][],
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Find which Senegal region contains a given coordinate.
 * Returns null if the point falls outside all known region polygons.
 */
export function findRegionAtPoint(
  lng: number,
  lat: number,
): SenegalRegion | null {
  for (const region of senegalRegions) {
    const ring = region.geometry.coordinates[0];
    if (pointInPolygon(lng, lat, ring)) {
      return region;
    }
  }
  return null;
}

/**
 * Get the bounding box [ne, sw] for a region polygon.
 * Returns { ne: [maxLng, maxLat], sw: [minLng, minLat] }.
 */
export function getRegionBounds(regionId: string): {
  ne: [number, number];
  sw: [number, number];
} | null {
  const region = senegalRegions.find((r) => r.properties.id === regionId);
  if (!region) return null;
  const coords = region.geometry.coordinates[0];
  const lngs = coords.map((c: number[]) => c[0]);
  const lats = coords.map((c: number[]) => c[1]);
  return {
    ne: [Math.max(...lngs), Math.max(...lats)],
    sw: [Math.min(...lngs), Math.min(...lats)],
  };
}
