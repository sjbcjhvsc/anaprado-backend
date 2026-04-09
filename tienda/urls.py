from django.urls import path
from .views import CheckoutView, WebhookPayUView, OrdenEstadoView

urlpatterns = [
    path("checkout/",          CheckoutView.as_view(),    name="checkout"),
    path("webhook/",           WebhookPayUView.as_view(), name="webhook-payu"),
    path("orden/<str:referencia>/", OrdenEstadoView.as_view(), name="orden-estado"),
]
