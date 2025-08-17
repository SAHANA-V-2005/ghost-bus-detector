import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

// ✅ Healthy marker (green)
const healthyMarker = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// ✅ Ghost marker (red)
const ghostMarker = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function BusMap() {
  const [buses, setBuses] = useState([]);
  const [hideGhosts, setHideGhosts] = useState(false);

  // 🔹 Initial fetch
  useEffect(() => {
    fetch("http://127.0.0.1:8000/buses")
      .then((res) => res.json())
      .then((data) => {
        console.log("HTTP buses:", data.buses);
        setBuses(data.buses || []);
      });
  }, []);

  // 🔹 WebSocket live updates
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/buses`);

    ws.onopen = () => console.log("✅ WebSocket connected");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS buses:", data.buses);
      setBuses(data.buses || []);
    };
    ws.onclose = () => console.log("❌ WebSocket closed");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, []);

  // 🔹 Apply filter
  const displayedBuses = hideGhosts
    ? buses.filter((bus) => bus.status !== "ghost")
    : buses;

  return (
    <div className="map-wrapper">
      {/* Floating filter box */}
      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={hideGhosts}
            onChange={(e) => setHideGhosts(e.target.checked)}
          />
          Hide Ghost Buses
        </label>
      </div>

      {/* Full screen map */}
      <MapContainer
        center={[42.3601, -71.0589]} // Boston center
        zoom={12}
        className="leaflet-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {displayedBuses
          .filter((bus) => bus.latitude && bus.longitude)
          .map((bus) => (
            <Marker
              key={bus.id}
              position={[bus.latitude, bus.longitude]}
              icon={bus.status === "ghost" ? ghostMarker : healthyMarker}
            >
              <Popup>
                <strong>Bus ID:</strong> {bus.id} <br />
                <strong>Status:</strong> {bus.status} <br />
                <strong>Last Update:</strong>{" "}
                {new Date(bus.timestamp * 1000).toLocaleTimeString()}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default BusMap;
