"""
tienda/views.py
Tres endpoints:
  POST /api/tienda/checkout/        – crea la orden y la envía a PayU
  POST /api/tienda/webhook/         – recibe notificación de PayU (IPN)
  GET  /api/tienda/orden/<ref>/     – consulta el estado de una orden
"""

import logging
import requests as http_requests

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Orden, OrdenItem
from .serializers import CrearOrdenSerializer, OrdenResumenSerializer
from .payu import (
    generar_referencia,
    construir_payload,
    ejecutar_pago,
    verificar_firma_webhook,
    mapear_estado,
)

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────
# 1. CHECKOUT
# ──────────────────────────────────────────────────────────────
class CheckoutView(APIView):
    """
    Recibe la bolsa + datos del comprador + token PayU.
    Crea la Orden en BD, llama a PayU y devuelve el resultado.
    """

    def post(self, request):
        serializer = CrearOrdenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"ok": False, "errores": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data  = serializer.validated_data
        items = data["items"]
        total = serializer.calcular_total(items)

        # ── Crear orden en BD ──────────────────────────
        referencia = generar_referencia()
        orden_obj  = Orden.objects.create(
            nombre     = data["nombre"],
            email      = data["email"],
            telefono   = data.get("telefono", ""),
            direccion  = data.get("direccion", ""),
            ciudad     = data.get("ciudad", "Bogotá"),
            total      = total,
            referencia = referencia,
            estado     = "pendiente",
        )
        for item in items:
            OrdenItem.objects.create(
                orden       = orden_obj,
                producto_id = item["producto_id"],
                nombre      = item["nombre"],
                marca       = item["marca"],
                cantidad    = item["cantidad"],
                precio      = item["precio"],
            )

        # ── Llamar a PayU ──────────────────────────────
        payload = construir_payload(
            orden={
                "nombre":      data["nombre"],
                "email":       data["email"],
                "telefono":    data.get("telefono", ""),
                "direccion":   data.get("direccion", ""),
                "ciudad":      data.get("ciudad", "Bogotá"),
                "total":       str(total),
                "referencia":  referencia,
                "metodo_pago": data.get("metodo_pago", "CARD"),
                "credit_card": data.get("credit_card", {}),
                "session_id":  data.get("session_id", ""),
                "ip":          request.META.get("REMOTE_ADDR", ""),
                "user_agent":  request.META.get("HTTP_USER_AGENT", ""),
                "cookie":      request.COOKIES.get("JSESSIONID", ""),
            },
            items=items,
        )

        try:
            respuesta = ejecutar_pago(payload)
        except http_requests.HTTPError as exc:
            logger.error("PayU HTTP error: %s", exc)
            orden_obj.estado = "error"
            orden_obj.save(update_fields=["estado"])
            return Response(
                {"ok": False, "error": "Error al conectar con la pasarela de pago."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as exc:
            logger.exception("PayU unexpected error: %s", exc)
            orden_obj.estado = "error"
            orden_obj.save(update_fields=["estado"])
            return Response(
                {"ok": False, "error": "Error inesperado al procesar el pago."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ── Parsear respuesta PayU ─────────────────────
        tx      = respuesta.get("transactionResponse", {})
        tx_state = tx.get("state", "ERROR")  # APPROVED / DECLINED / PENDING / ERROR
        tx_id   = tx.get("transactionId", "")
        order_id = tx.get("orderId", "")

        estado_local = {
            "APPROVED": "aprobada",
            "DECLINED": "rechazada",
            "PENDING":  "pendiente",
            "ERROR":    "error",
        }.get(tx_state, "error")

        orden_obj.estado         = estado_local
        orden_obj.payu_tx_id     = tx_id
        orden_obj.payu_order_id  = str(order_id)
        orden_obj.respuesta_payu = respuesta
        orden_obj.save()

        logger.info(
            "Orden %s | PayU estado: %s | TX: %s",
            referencia, tx_state, tx_id,
        )

        return Response({
            "ok":         estado_local == "aprobada",
            "estado":     estado_local,
            "referencia": referencia,
            "payu_tx_id": tx_id,
            "mensaje":    tx.get("responseMessage", ""),
        }, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────────────────────
# 2. WEBHOOK (IPN de PayU)
# ──────────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class WebhookPayUView(APIView):
    """
    PayU llama a este endpoint cuando cambia el estado de una transacción.
    Configurarlo en el panel de PayU como 'URL de confirmación'.
    """
    authentication_classes = []
    permission_classes     = []

    def post(self, request):
        data = request.data

        # Verificar firma
        if not verificar_firma_webhook(data):
            logger.warning("Webhook PayU: firma inválida. Data: %s", data)
            return Response({"ok": False}, status=status.HTTP_400_BAD_REQUEST)

        referencia = data.get("reference_sale", "")
        state_pol  = data.get("state_pol", "")

        try:
            orden = Orden.objects.get(referencia=referencia)
        except Orden.DoesNotExist:
            logger.error("Webhook: orden no encontrada para referencia %s", referencia)
            return Response({"ok": False}, status=status.HTTP_404_NOT_FOUND)

        nuevo_estado = mapear_estado(state_pol)
        orden.estado         = nuevo_estado
        orden.payu_order_id  = data.get("order_id", orden.payu_order_id)
        orden.payu_tx_id     = data.get("transaction_id", orden.payu_tx_id)
        orden.respuesta_payu = data
        orden.save()

        logger.info(
            "Webhook: orden %s actualizada a '%s'",
            referencia, nuevo_estado,
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)

    def get(self, request):
        # PayU a veces hace GET para verificar disponibilidad
        return Response({"ok": True}, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────────────────────
# 3. CONSULTAR ESTADO DE ORDEN
# ──────────────────────────────────────────────────────────────
class OrdenEstadoView(APIView):
    """
    GET /api/tienda/orden/<referencia>/
    El frontend consulta este endpoint después del pago
    para mostrar la pantalla de confirmación.
    """

    def get(self, request, referencia):
        try:
            orden = Orden.objects.prefetch_related("items").get(referencia=referencia)
        except Orden.DoesNotExist:
            return Response(
                {"ok": False, "error": "Orden no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(OrdenResumenSerializer(orden).data)
