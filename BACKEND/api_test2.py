import urllib.request
import urllib.parse
import json

url = "http://127.0.0.1:8000/api/auth/login/"
data = json.dumps({"username":"provider1","password":"123"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as res:
        res_data = json.loads(res.read().decode())
        token = res_data.get('access')
        print(f"Got token")
        
        url_panel = "http://127.0.0.1:8000/api/alerts/panel/"
        req_panel = urllib.request.Request(url_panel, headers={"Authorization": f"Bearer {token}"})
        
        with urllib.request.urlopen(req_panel) as panel_res:
             panel_data = json.loads(panel_res.read().decode())
             print(f"Posted Reviews: {len(panel_data.get('posted_reviews', []))}")
             if panel_data.get('posted_reviews'):
                 print(panel_data['posted_reviews'][0])
except Exception as e:
    print(f"Error: {e}")
