from django.contrib import admin
from .models import MensajeContacto


@admin.register(MensajeContacto)
class MensajeContactoAdmin(admin.ModelAdmin):
    list_display  = ("nombre", "email", "telefono", "leido", "creado")
    list_filter   = ("leido",)
    search_fields = ("nombre", "email", "mensaje")
    readonly_fields = ("nombre", "email", "telefono", "mensaje", "creado")
    ordering      = ("-creado",)

    # Acción para marcar como leído en lote
    actions = ["marcar_leido", "marcar_no_leido"]

    @admin.action(description="Marcar seleccionados como leídos")
    def marcar_leido(self, request, queryset):
        queryset.update(leido=True)

    @admin.action(description="Marcar seleccionados como no leídos")
    def marcar_no_leido(self, request, queryset):
        queryset.update(leido=False)
