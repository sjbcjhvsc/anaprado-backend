from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/contacto/", include("contacto.urls")),
    path("api/tienda/",   include("tienda.urls")),
]
