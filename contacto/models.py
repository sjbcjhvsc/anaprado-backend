from django.db import models

class MensajeContacto(models.Model):
    """
    Guarda cada mensaje enviado desde el formulario de contacto.
    Visible en el panel /admin/ de Django.
    """
    nombre   = models.CharField(max_length=150)
    email    = models.EmailField()
    telefono = models.CharField(max_length=30, blank=True, default="")
    mensaje  = models.TextField()
    leido    = models.BooleanField(default=False)   # para marcar desde el admin
    creado   = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = "Mensaje de contacto"
        verbose_name_plural = "Mensajes de contacto"
        ordering            = ["-creado"]

    def __str__(self):
        return f"{self.nombre} — {self.email} ({self.creado:%d/%m/%Y %H:%M})"
