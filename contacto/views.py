from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import MensajeContactoSerializer


class ContactoView(APIView):
    """
    POST /api/contacto/
    Recibe el formulario, valida y guarda en BD.
    """

    def get(self, request):
        return Response({"mensaje": "API contacto funcionando 🚀"})

    def post(self, request):
        serializer = MensajeContactoSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"ok": False, "errores": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()

        return Response(
            {"ok": True, "mensaje": "Tu mensaje fue recibido. Pronto te contactaremos."},
            status=status.HTTP_201_CREATED,
        )
