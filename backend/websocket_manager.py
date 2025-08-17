import asyncio
import json
from fetch_data import fetch_buses

async def bus_websocket(ws, interval=1):
    """Stream live bus updates to connected clients every `interval` seconds."""
    await ws.accept()
    try:
        while True:
            buses = await fetch_buses()
            await ws.send_text(json.dumps({"buses": buses}))
            await asyncio.sleep(interval)
    except Exception as e:
        print("WebSocket error:", e)
    finally:
        await ws.close()
