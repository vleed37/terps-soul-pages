import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Stockist } from "@/lib/types";

// Gold pin icon as inline SVG
const goldPin = L.divIcon({
  className: "",
  html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.27 21.73 0 14 0z" fill="#C9A84C"/>
    <circle cx="14" cy="14" r="5" fill="#0A0A0A"/>
  </svg>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -34],
});

function FlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1.2 });
  }, [center, map]);
  return null;
}

export function StockistMap({
  stockists,
  focused,
  onMarkerClick,
}: {
  stockists: Stockist[];
  focused: Stockist | null;
  onMarkerClick: (s: Stockist) => void;
}) {
  const withCoords = stockists.filter(
    (s) => typeof s.latitude === "number" && typeof s.longitude === "number",
  );
  const center: [number, number] = withCoords[0]
    ? [withCoords[0].latitude!, withCoords[0].longitude!]
    : [-29.0, 24.0]; // central SA fallback

  const flyCenter: [number, number] | null =
    focused && focused.latitude != null && focused.longitude != null
      ? [focused.latitude, focused.longitude]
      : null;

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ background: "#0A0A0A" }}
    >
      {/* Dark luxury tiles via CARTO */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
      />
      {withCoords.map((s) => (
        <Marker
          key={s.id}
          position={[s.latitude!, s.longitude!]}
          icon={goldPin}
          eventHandlers={{ click: () => onMarkerClick(s) }}
        >
          <Popup className="terps-popup">
            <div className="font-display text-base mb-1">{s.name}</div>
            <div className="text-xs text-neutral-300">{s.address}</div>
          </Popup>
        </Marker>
      ))}
      <FlyTo center={flyCenter} />
    </MapContainer>
  );
}
