import React from "react";
import BusMap from "./BusMap";
import "./App.css"; // ✅ ensure CSS is imported

function App() {
  return (
    <div className="map-wrapper">
      <BusMap />
    </div>
  );
}

export default App;
