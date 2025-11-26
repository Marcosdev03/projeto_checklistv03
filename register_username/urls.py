from django.urls import path
from .views import UsernameMeView

# ============================================================
# Rotas do app register_username
#
# /api/username/me/
# ============================================================
urlpatterns = [
    path("me/", UsernameMeView.as_view(), name="username-me"),
]
