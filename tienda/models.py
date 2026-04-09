from django.db import models


class Orden(models.Model):
    """
    Encabezado de una orden de compra.
    Se crea cuando el usuario inicia el pago con PayU.
    """

    ESTADO_CHOICES = [
        ("pendiente",  "Pendiente"),
        ("aprobada",   "Aprobada"),
        ("rechazada",  "Rechazada"),
        ("cancelada",  "Cancelada"),
        ("error",      "Error"),
    ]

    # Datos del comprador
    nombre         = models.CharField(max_length=150)
    email          = models.EmailField()
    telefono       = models.CharField(max_length=30, blank=True, default="")
    direccion      = models.CharField(max_length=300, blank=True, default="")
    ciudad         = models.CharField(max_length=100, blank=True, default="")

    # Totales
    total          = models.DecimalField(max_digits=14, decimal_places=2)
    moneda         = models.CharField(max_length=5, default="COP")

    # PayU
    referencia     = models.CharField(max_length=100, unique=True)  # ID propio
    payu_order_id  = models.CharField(max_length=100, blank=True, default="")
    payu_tx_id     = models.CharField(max_length=100, blank=True, default="")
    estado         = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="pendiente")
    respuesta_payu = models.JSONField(null=True, blank=True)  # respuesta raw

    creada         = models.DateTimeField(auto_now_add=True)
    actualizada    = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Orden"
        verbose_name_plural = "Órdenes"
        ordering            = ["-creada"]

    def __str__(self):
        return f"Orden {self.referencia} — {self.nombre} — {self.estado}"


class OrdenItem(models.Model):
    """Línea de producto dentro de una Orden."""

    orden       = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name="items")
    producto_id = models.IntegerField()
    nombre      = models.CharField(max_length=200)
    marca       = models.CharField(max_length=100)
    cantidad    = models.PositiveIntegerField(default=1)
    precio      = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name        = "Ítem de orden"
        verbose_name_plural = "Ítems de orden"

    def subtotal(self):
        return self.cantidad * self.precio

    def __str__(self):
        return f"{self.cantidad}x {self.nombre} (Orden {self.orden.referencia})"
