from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static   # <-- IMPORTANTE

urlpatterns = [

    # Painel Django
    path('admin/', admin.site.urls),

    # Rotas de autenticação
    path("api/authentication/", include("authentication.urls")),

    # Rotas de username
    path("api/username/", include("register_username.urls")),

    # Rotas do módulo de tasks
    path("api/tasks/", include("tasks.urls")),
]

#  SERVE OS ARQUIVOS ESTÁTICOS
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
