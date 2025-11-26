from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import CustomTokenObtainPairView

from .views import (
    RegisterAPI,
    ForgotPasswordView,
    VerifyCodeView,
    ResetPasswordView,
    VerifyEmailView
)

urlpatterns = [
    # Registro
    path("register/", RegisterAPI.as_view(), name="register"),

    # --------------------------------------------------------
    # LOGIN personalizado
    # Retorna:
    # - access
    # - refresh
    # - has_username
    # - current_username
    # - suggested_username
    # --------------------------------------------------------
    path("login/", CustomTokenObtainPairView.as_view(), name="login_token"),

    # Reset por código
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("verify-code/", VerifyCodeView.as_view(), name="verify-code"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),


]
