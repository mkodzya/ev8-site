// Where a battery is swapped: the showroom and three Agrohub points — the list
// of the live ev8.ge page /svap-sadgurebi/ (changed 01.10.2026), taken on
// Mika's word of 03.10.2026 ("Б, бери как на ev8.ge"). It replaces the four
// Agrohub addresses of the handbook's business/places.md, which were places
// for future stations. Coordinates are the ones behind ev8.ge's own
// "Directions" links. "Swaps 24/7" and "in 15 seconds" are that page's words too.
export const stations = [
  { id: 'showroom', lat: 41.7290618, lng: 44.7453095 },
  { id: 'gelovani', lat: 41.7483285, lng: 44.7695654 },
  { id: 'gamsakhurdia', lat: 41.7049119, lng: 44.7935878 },
  { id: 'chiladze', lat: 41.7283687, lng: 44.7616397 },
];

/** Directions to a station, as ev8.ge links them. */
export const directions = (s: { lat: number; lng: number }) =>
  `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
