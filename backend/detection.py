import time
from math import radians, cos, sin, sqrt, atan2

# Example layover points (adjust based on city data)
LAYOVER_POINTS = [
    {"lat": 42.352271, "lon": -71.055242, "radius": 100},  
    {"lat": 42.365577, "lon": -71.103, "radius": 100},     
]

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance (meters) between two lat/lon points."""
    R = 6371000
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)

    a = sin(dphi/2)**2 + cos(phi1) * cos(phi2) * sin(dlambda/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def is_at_layover(lat, lon):
    """Check if bus is within radius of a layover point."""
    for point in LAYOVER_POINTS:
        if haversine_distance(lat, lon, point["lat"], point["lon"]) <= point["radius"]:
            return True
    return False

def detect_status(bus, now=None):
    """
    Returns 'ghost' if:
      1. Last update > 7 min
      2. Stationary > 20 min at non-layover
    Else 'healthy'
    """
    if now is None:
        now = int(time.time())

    last_update = bus.get("timestamp", 0)
    lat, lon = bus.get("latitude"), bus.get("longitude")

    if not last_update or lat is None or lon is None:
        return "ghost"

    # Rule 1: stale timestamp
    if (now - last_update) > 420:  # 7 minutes
        return "ghost"

    # Rule 2: stationary too long
    prev = bus.get("previous")
    if prev:
        dist = haversine_distance(lat, lon, prev["lat"], prev["lon"])
        time_diff = now - prev["time"]

        if dist < 30 and time_diff > 1200 and not is_at_layover(lat, lon):
            return "ghost"

    return "healthy"
