from django.contrib import admin
from .models import Orden, OrdenItem


class OrdenItemInline(admin.TabularInline):
    model   = OrdenItem
    extra   = 0
    readonly_fields = ("producto_id", "nombre", "marca", "cantidad", "precio")
    can_delete = False


@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display   = ("referencia", "nombre", "email", "total", "estado", "creada")
    list_filter    = ("estado", "moneda")
    search_fields  = ("referencia", "nombre", "email", "payu_tx_id")
    readonly_fields = (
        "referencia", "nombre", "email", "telefono", "direccion", "ciudad",
        "total", "moneda", "payu_order_id", "payu_tx_id", "respuesta_payu", "creada",
    )
    ordering       = ("-creada",)
    inlines        = [OrdenItemInline]

    # Solo el campo estado es editable (para correcciones manuales)
    fields = (
        "referencia", "nombre", "email", "telefono", "direccion", "ciudad",
        "total", "moneda", "estado",
        "payu_order_id", "payu_tx_id", "respuesta_payu", "creada",
    )
