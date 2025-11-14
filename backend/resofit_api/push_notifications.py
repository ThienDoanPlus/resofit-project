import requests

def send_push_message(token, title, message, extra_data={}):
    if not token:
        return False
    try:
        requests.post(
            'https://exp.host/--/api/v2/push/send',
            json={
                'to': token,
                'title': title,
                'body': message,
                'data': extra_data,
            }
        )
        return True
    except Exception as e:
        print(f"Failed to send push notification: {e}")
        return False