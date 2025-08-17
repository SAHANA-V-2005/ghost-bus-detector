import aiohttp
import time
from google.transit import gtfs_realtime_pb2
from detection import detect_status

GTFS_URL = "https://cdn.mbta.com/realtime/VehiclePositions.pb"

# In-memory tracker for bus history
bus_history = {}

async def fetch_buses():
    async with aiohttp.ClientSession() as session:
        async with session.get(GTFS_URL) as response:
            if response.status != 200:
                return []

            raw_data = await response.read()
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(raw_data)

            buses = []
            now = int(time.time())

            for entity in feed.entity:
                if entity.HasField("vehicle"):
                    bus = entity.vehicle
                    bus_id = bus.vehicle.id
                    lat, lon, ts = bus.position.latitude, bus.position.longitude, bus.timestamp

                    # Track history
                    prev = bus_history.get(bus_id, None)
                    bus_history[bus_id] = {"lat": lat, "lon": lon, "time": ts}

                    bus_obj = {
                        "id": bus_id,
                        "latitude": lat,
                        "longitude": lon,
                        "timestamp": ts,
                        "previous": prev
                    }

                    # Run detection
                    bus_obj["status"] = detect_status(bus_obj, now)
                    buses.append(bus_obj)

            return buses
