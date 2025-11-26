from django.contrib import admin
from django.urls import path, include

urlpatterns = [

    # Painel Django
    path('admin/', admin.site.urls),

    # Rotas de autenticação (seu “app” actual)
    path("api/authentication/", include("authentication.urls")),

    # Rotas do módulo de username
    path("api/username/", include("register_username.urls")),
]
