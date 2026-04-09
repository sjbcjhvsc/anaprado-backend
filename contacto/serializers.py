from rest_framework import serializers
from .models import MensajeContacto


class MensajeContactoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MensajeContacto
        fields = ["nombre", "email", "telefono", "mensaje"]

    # Validaciones extra
    def validate_nombre(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre es demasiado corto.")
        return value.strip()

    def validate_mensaje(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("El mensaje debe tener al menos 10 caracteres.")
        return value.strip()
