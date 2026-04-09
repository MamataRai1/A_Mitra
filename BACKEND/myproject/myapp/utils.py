import requests, os
from dotenv import load_dotenv

load_dotenv()

def get_headers():
    return {
        "Authorization": f"key {os.getenv('KHALTI_SECRET_KEY')}",
        "Content-Type": "application/json",
    }

def initiate_khalti_payment(payment, return_url, user):
    url = f"{os.getenv('KHALTI_API_URL').rstrip('/')}/epayment/initiate/"
    payload = {
        "return_url": return_url,
        "website_url": os.getenv("WEBSITE_URL", "http://localhost:3000"),
        "amount": int(payment.amount * 100),  # Amount in paisa
        "purchase_order_id": str(payment.id),
        "purchase_order_name": f"Payment #{payment.id}",
        "customer_info": {
            "name": user.username,
            "email": getattr(user, 'email', 'fallback@example.com') or 'fallback@example.com',
            "phone": "9800000000",
        },
    }
    response = requests.post(url, json=payload, headers=get_headers())
    data = response.json()
    
    if response.status_code != 200:
        raise Exception(f"Failed to initiate Khalti payment: {data}")

    payment.pidx = data["pidx"]
    payment.save()
    return data["payment_url"]

def verify_khalti_payment(pidx):
    url = f"{os.getenv('KHALTI_API_URL').rstrip('/')}/epayment/lookup/"
    response = requests.post(url, json={"pidx": pidx}, headers=get_headers())
    data = response.json()

    if data.get("status") != "Completed":
        raise Exception(f"Payment not completed: {data.get('status')}")

    from .models import Payment
    payment = Payment.objects.filter(pidx=pidx).first()
    if payment and payment.status != "completed":
        payment.status = "completed"
        payment.transaction_id = data.get("transaction_id")
        payment.method = "khalti"
        payment.save()

    return payment
