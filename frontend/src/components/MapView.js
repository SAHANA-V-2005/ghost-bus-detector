import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

function MapView({ buses }) {
  const map = useMap();

  useEffect(() => {
    if (buses.length > 0) {
      const bounds = L.latLngBounds(buses.map((b) => [b.latitude, b.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [buses, map]);

  return null;
}

export default MapView;
