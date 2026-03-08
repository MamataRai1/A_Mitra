import urllib.request
import json

url = "http://127.0.0.1:8000/api/services/"
try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
        print(f"Total services returned by API: {len(data)}")
        for s in data:
            print(f" - {s.get('name')} (Provider: {s['provider']['user']['username']})")
except Exception as e:
    print(f"Error: {e}")
