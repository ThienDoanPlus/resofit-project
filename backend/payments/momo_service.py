import hashlib
import hmac
import json
import uuid
import requests
from django.conf import settings


def create_momo_payment_request(order_id, amount, order_info, extra_data):
    request_id = str(uuid.uuid4())
    amount_str = str(int(amount))

    # URL mà MoMo sẽ gọi khi thanh toán hoàn tất (IPN)
    notify_url = f"{settings.NGROK_URL}/api/payments/momo-ipn/"

    # URL người dùng sẽ được chuyển đến sau khi thanh toán trên app MoMo
    return_url = "resofit://payment-success"

    raw_signature = (
        f"accessKey={settings.MOMO_ACCESS_KEY}"
        f"&amount={amount_str}"
        f"&extraData={extra_data}"
        f"&ipnUrl={notify_url}"
        f"&orderId={order_id}"
        f"&orderInfo={order_info}"
        f"&partnerCode={settings.MOMO_PARTNER_CODE}"
        f"&redirectUrl={return_url}"
        f"&requestId={request_id}"
        f"&requestType=captureWallet"
    )

    signature = hmac.new(
        settings.MOMO_SECRET_KEY.encode('utf-8'),
        raw_signature.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    payload = {
        "partnerCode": settings.MOMO_PARTNER_CODE,
        "requestId": request_id,
        "amount": amount_str,
        "orderId": order_id,
        "orderInfo": order_info,
        "redirectUrl": return_url,
        "ipnUrl": notify_url,
        "lang": "vi",
        "extraData": extra_data,
        "requestType": "captureWallet",
        "signature": signature,
    }

    response = requests.post(settings.MOMO_ENDPOINT, data=json.dumps(payload),
                             headers={'Content-Type': 'application/json'})

    if response.status_code == 200:
        return response.json(), request_id
    else:
        return None, None