from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "status": "ok",
        "message": "API Ana Prado funcionando 🚀"
    })

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/contacto/", include("contacto.urls")),
    path("api/tienda/",   include("tienda.urls")),
]