"""
tienda/payu.py
Lógica de integración con PayU Latam (Colombia).
Documentación oficial: https://developers.payulatam.com/latam/es/docs
"""

import hashlib
import uuid
import requests
from django.conf import settings


# ─────────────────────────────────────────────
# FIRMA MD5
# Formato: apiKey~merchantId~referenceCode~amount~currency
# ─────────────────────────────────────────────
def generar_firma(referencia: str, monto: str, moneda: str = "COP") -> str:
    cadena = (
        f"{settings.PAYU_API_KEY}~"
        f"{settings.PAYU_MERCHANT_ID}~"
        f"{referencia}~"
        f"{monto}~"
        f"{moneda}"
    )
    return hashlib.md5(cadena.encode()).hexdigest()


def generar_referencia() -> str:
    """Referencia única para cada orden (máx. 255 chars)."""
    return f"AP-{uuid.uuid4().hex[:16].upper()}"


# ─────────────────────────────────────────────
# PAYLOAD DE PAGO
# ─────────────────────────────────────────────
def construir_payload(orden, items) -> dict:
    """
    Construye el JSON que se envía a la API de PayU.
    `orden`  – dict con datos del comprador
    `items`  – lista de dicts {nombre, cantidad, precio_unitario}
    """
    monto     = str(orden["total"])
    referencia = orden["referencia"]
    firma     = generar_firma(referencia, monto)

    # Descripción corta del pedido (máx. 255 chars)
    descripcion = ", ".join(
        f"{i['cantidad']}x {i['nombre']}" for i in items
    )[:255]

    payload = {
        "language": "es",
        "command": "SUBMIT_TRANSACTION",
        "merchant": {
            "apiLogin": settings.PAYU_API_LOGIN,
            "apiKey":   settings.PAYU_API_KEY,
        },
        "transaction": {
            "order": {
                "accountId":       settings.PAYU_ACCOUNT_ID,
                "referenceCode":   referencia,
                "description":     descripcion,
                "language":        "es",
                "signature":       firma,
                "notifyUrl":       f"{settings.FRONTEND_URL}/api/tienda/webhook/",
                "additionalValues": {
                    "TX_VALUE": {
                        "value":    monto,
                        "currency": orden.get("moneda", "COP"),
                    },
                },
                "buyer": {
                    "fullName":     orden["nombre"],
                    "emailAddress": orden["email"],
                    "contactPhone": orden.get("telefono", ""),
                    "shippingAddress": {
                        "street1": orden.get("direccion", ""),
                        "city":    orden.get("ciudad", "Bogotá"),
                        "country": "CO",
                    },
                },
            },
            "payer": {
                "fullName":     orden["nombre"],
                "emailAddress": orden["email"],
                "contactPhone": orden.get("telefono", ""),
            },
            "type":        "AUTHORIZATION_AND_CAPTURE",
            "paymentMethod": orden.get("metodo_pago", "CARD"),
            "paymentCountry": "CO",
            "deviceSessionId": orden.get("session_id", "sessionId"),
            "ipAddress":       orden.get("ip", "127.0.0.1"),
            "cookie":          orden.get("cookie", ""),
            "userAgent":       orden.get("user_agent", ""),
            # Datos de tarjeta (llegan cifrados desde el front con PayU JS)
            "creditCard": orden.get("credit_card", {}),
        },
        "test": settings.PAYU_TEST,
    }
    return payload


# ─────────────────────────────────────────────
# LLAMADA A LA API
# ─────────────────────────────────────────────
def ejecutar_pago(payload: dict) -> dict:
    """
    Envía el payload a PayU y retorna la respuesta parseada.
    Lanza requests.HTTPError si el servidor responde con error HTTP.
    """
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    resp = requests.post(
        settings.PAYU_BASE_URL,
        json=payload,
        headers=headers,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


# ─────────────────────────────────────────────
# VERIFICAR FIRMA DEL WEBHOOK
# Formato PayU: md5(apiKey~merchantId~referenceCode~TX_VALUE~currency~state_pol)
# ─────────────────────────────────────────────
def verificar_firma_webhook(data: dict) -> bool:
    firma_recibida = data.get("sign", "")
    cadena = (
        f"{settings.PAYU_API_KEY}~"
        f"{settings.PAYU_MERCHANT_ID}~"
        f"{data.get('reference_sale', '')}~"
        f"{data.get('value', '')}~"
        f"{data.get('currency', '')}~"
        f"{data.get('state_pol', '')}"
    )
    firma_calculada = hashlib.md5(cadena.encode()).hexdigest()
    return firma_recibida == firma_calculada


# ─────────────────────────────────────────────
# MAPEO DE ESTADOS PAYU → ESTADOS LOCALES
# ─────────────────────────────────────────────
ESTADO_MAP = {
    "4": "aprobada",
    "6": "rechazada",
    "5": "cancelada",
    "7": "pendiente",
    "12": "pendiente",
    "14": "pendiente",
}

def mapear_estado(state_pol: str) -> str:
    return ESTADO_MAP.get(str(state_pol), "error")
