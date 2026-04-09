from rest_framework import serializers
from .models import Orden, OrdenItem


class OrdenItemSerializer(serializers.Serializer):
    """Ítem de la bolsa enviado desde el frontend."""
    producto_id = serializers.IntegerField()
    nombre      = serializers.CharField(max_length=200)
    marca       = serializers.CharField(max_length=100)
    cantidad    = serializers.IntegerField(min_value=1)
    precio      = serializers.DecimalField(max_digits=12, decimal_places=2)


class CrearOrdenSerializer(serializers.Serializer):
    """
    Payload completo que envía el frontend al hacer checkout.
    Incluye datos del comprador + bolsa + datos de pago PayU.
    """
    # Comprador
    nombre    = serializers.CharField(max_length=150)
    email     = serializers.EmailField()
    telefono  = serializers.CharField(max_length=30, required=False, default="")
    direccion = serializers.CharField(max_length=300, required=False, default="")
    ciudad    = serializers.CharField(max_length=100, required=False, default="Bogotá")

    # Bolsa
    items = OrdenItemSerializer(many=True, min_length=1)

    # PayU (tokenización desde el frontend con PayU.js)
    metodo_pago  = serializers.CharField(default="CARD")
    credit_card  = serializers.DictField(required=False, default=dict)
    session_id   = serializers.CharField(required=False, default="")
    ip           = serializers.CharField(required=False, default="")
    user_agent   = serializers.CharField(required=False, default="")
    cookie       = serializers.CharField(required=False, default="")

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("La bolsa no puede estar vacía.")
        return items

    def calcular_total(self, items):
        return sum(i["precio"] * i["cantidad"] for i in items)


class OrdenResumenSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model  = Orden
        fields = [
            "referencia", "nombre", "email", "total", "moneda",
            "estado", "payu_order_id", "payu_tx_id", "creada", "items",
        ]

    def get_items(self, obj):
        return OrdenItemSerializer(obj.items.all(), many=True).data
