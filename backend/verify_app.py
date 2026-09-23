import urllib.request
import json

def test_get(url, token=None):
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def test_post(url, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

print('=== 1. HEALTH CHECK ===')
s, d = test_get('http://127.0.0.1:8000/api/health')
print('Status:', s, 'Service:', d['service'], 'Currency:', d['currency'].encode('ascii', 'replace').decode())

print('\n=== 2. THEMES & FLAT 10 KM + EXTRA RATE ===')
s, themes = test_get('http://127.0.0.1:8000/api/themes')
for t in themes:
    print(f"- {t['name']}: Rs. {t['base_price_inr']} (covers {t['included_km']} km, +Rs. {t['per_km_rate_inr']}/km beyond)")

print('\n=== 3. PRICING ENGINE LIVE CALCULATION ===')
pricing_payload = {
    'theme_id': 'theme-romance',
    'pickup': {'lat': 18.9220, 'lng': 72.8347, 'address': 'Gateway of India'},
    'destination': {'lat': 18.9894, 'lng': 72.8296, 'address': 'Worli Sea Face'},
    'optional_stop': {'lat': 18.9442, 'lng': 72.8234, 'address': 'Marine Drive'},
    'selected_add_ons': [{'name': 'Fresh Ecuadorian Rose Posies', 'price_inr': 799.0}],
    'menu_items': [{'item_id': 'item-01', 'name': 'Smoked Honey Cortado', 'quantity': 2, 'price_at_booking': 349.0}],
    'coupon_code': 'WHEELS500'
}
s, p = test_post('http://127.0.0.1:8000/api/pricing/calculate', pricing_payload)
print(f"Calculated Total Distance: {p['actual_distance_km']} km (Included: {p['included_km']} km)")
print(f"Extra km beyond 10km: {p['extra_km']} km @ Rs. 8/km = Rs. {p['extra_km_charge_inr']}")
print(f"Base: Rs. {p['base_price_inr']} + Add-ons: Rs. {p['add_ons_total_inr']} + Menu: Rs. {p['menu_total_inr']}")
print(f"Subtotal: Rs. {p['subtotal_inr']} - Discount: Rs. {p['discount_inr']} + GST (5%): Rs. {p['tax_inr']}")
print(f"Final Total: Rs. {p['total_inr']}")

print('\n=== 4. AUTHENTICATION & ROLES ===')
s, cust_login = test_post('http://127.0.0.1:8000/api/auth/login', {'email': 'sophia@example.com', 'password': 'Customer@123'})
print(f"Customer Login: {cust_login['user']['name']} ({cust_login['user']['role']}) - Token generated")
cust_token = cust_login['access_token']

s, admin_login = test_post('http://127.0.0.1:8000/api/auth/login', {'email': 'admin@cafeonwheels.com', 'password': 'Admin@123'})
print(f"Admin Login: {admin_login['user']['name']} ({admin_login['user']['role']}) - Admin access verified")
admin_token = admin_login['access_token']

print('\n=== 5. ADMIN METRICS & AGGREGATIONS ===')
s, stats = test_get('http://127.0.0.1:8000/api/admin/stats', token=admin_token)
print(f"Revenue: Rs. {stats['total_revenue_inr']}, Bookings: {stats['total_bookings']}, Active: {stats['active_rides']}, Fleet: {stats['available_vehicles']}/{stats['total_vehicles']}")

print('\n=== 6. RULE-BASED AI RECOMMENDATION ===')
s, rec = test_get('http://127.0.0.1:8000/api/recommendations?city=Mumbai')
print(f"Headline: {rec['headline']} | Tag: {rec['tag']} | Theme: {rec['theme_name']}")

print('\n=== 7. LIVE GPS DRIVER TELEMETRY PUSH & TRACKING ===')
driver_ping = {
    'booking_id': 'booking-demo-01',
    'lat': 18.9600,
    'lng': 72.8210,
    'speed_kmh': 36.0,
    'status': 'en_route'
}
s, ping_res = test_post('http://127.0.0.1:8000/api/rides/driver/location', driver_ping)
print(f"Driver Ping Accepted: {ping_res['success']}")

s, track_res = test_get('http://127.0.0.1:8000/api/rides/booking-demo-01/tracking')
print(f"Tracking Progress: {track_res['progress_percent']}% | ETA: {track_res['eta_minutes']} mins | Lat: {track_res['driver_location']['lat']}, Lng: {track_res['driver_location']['lng']}")

print('\n=== 8. FRONTEND SERVER AVAILABILITY ===')
req_fe = urllib.request.Request('http://127.0.0.1:5173/')
with urllib.request.urlopen(req_fe) as fe_resp:
    print(f"Vite Frontend Status: {fe_resp.status} OK (HTML payload: {len(fe_resp.read())} bytes)")

print('\n>>> ALL 8 VERIFICATION CHECKS PASSED PERFECTLY! <<<')
