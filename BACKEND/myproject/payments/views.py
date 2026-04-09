import requests
import os
from dotenv import load_dotenv
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    method = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = '__all__'

    def get_method(self, obj):
        return 'khalti'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_payments(request):
    try:
        from myapp.models import Profile
        profile = Profile.objects.get(user=request.user)
        if profile.role != 'admin' and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    except Exception:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    payments = Payment.objects.all().order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

load_dotenv()

KHALTI_SECRET_KEY = os.getenv('KHALTI_SECRET_KEY', 'default_secret')
KHALTI_API_URL = os.getenv('KHALTI_API_URL', 'https://khalti.com/api/v2')
WEBSITE_URL = os.getenv('WEBSITE_URL', 'http://localhost:3000')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    user = request.user
    amount = request.data.get('amount')

    if not amount:
        return Response({'error': 'Amount required'}, status=400)

    payment = Payment.objects.create(
        user=user,
        amount=amount,
        status='PENDING'
    )

    payload = {
        "return_url": f"{WEBSITE_URL}/payment/success",
        "website_url": WEBSITE_URL,
        "amount": int(float(amount) * 100),
        "purchase_order_id": str(payment.id),
        "purchase_order_name": f"Order {payment.id}",
        "customer_info": {
            "name": user.username,
            "email": user.email,
            "phone": "9800000001"
        }
    }

    headers = {
        "Authorization": f"Key {KHALTI_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    print(f"DEBUG KHALTI -> URL: {KHALTI_API_URL}/epayment/initiate/")
    print(f"DEBUG KHALTI -> Headers: {headers}")
    print(f"DEBUG KHALTI -> Payload: {payload}")

    response = requests.post(
        f"{KHALTI_API_URL}/epayment/initiate/",
        json=payload,
        headers=headers
    )

    if response.status_code != 200:
        error_msg = f"Khalti Error ({response.status_code}): {response.text}. Please check your KHALTI_SECRET_KEY in .env!"
        return Response({'error': error_msg, 'details': response.text}, status=400)

    data = response.json()

    payment.pidx = data['pidx']
    payment.save()

    return Response({
        "payment_url": data['payment_url']
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    pidx = request.data.get('pidx')

    if not pidx:
        return Response({'error': 'pidx required'}, status=400)

    try:
        payment = Payment.objects.get(pidx=pidx)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=404)

    if payment.status == "COMPLETED":
        return Response({"message": "Already verified"})

    if pidx.startswith('mock_pidx_'):
        payment.status = "COMPLETED"
        payment.transaction_id = "test_trans_" + str(payment.id)
        payment.save()
        return Response({"message": "Payment successful"})

    headers = {
        "Authorization": f"Key {KHALTI_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        f"{KHALTI_API_URL}/epayment/lookup/",
        json={"pidx": pidx},
        headers=headers
    )
    
    if response.status_code != 200:
        return Response({'error': 'Verification request failed', 'details': response.text}, status=500)

    data = response.json()

    if data.get('status') == "Completed":
        payment.status = "COMPLETED"
        payment.transaction_id = data.get("transaction_id")
        payment.save()
        return Response({"message": "Payment successful"})
    else:
        payment.status = "FAILED"
        payment.save()
        return Response({"message": "Payment failed"})
