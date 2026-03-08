import json
import urllib.request

try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/services/")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
    
    with open("test_api_log.txt", "w", encoding="utf-8") as f:
        f.write(f"Total services returned: {len(data)}\n")
        for s in data:
            provider = s.get("provider", {})
            avail = provider.get("availability", [])
            f.write(f"\nService ID: {s.get('id')} - {s.get('name')}\n")
            user_dict = provider.get("user") or {}
            f.write(f"Provider: {user_dict.get('username')} | Status: {provider.get('booking_status')}\n")
            f.write(f"Availability Slots: {len(avail)}\n")
            for a in avail:
                f.write(f"  Date: {a.get('date')} to {a.get('end_time')} (Active: {a.get('is_active')})\n")
    print("Log written to test_api_log.txt")
except Exception as e:
    import traceback
    with open("test_api_log.txt", "w", encoding="utf-8") as f:
        f.write(f"Error: {e}\n{traceback.format_exc()}")
    print("Error written to test_api_log.txt")
