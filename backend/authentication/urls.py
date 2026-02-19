from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegistrationSendCodeView,
    RegistrationVerifyCodeView,
    RegistrationCompleteView,
    ForgotPasswordView,
    VerifyCodeView,
    ResetPasswordView,
    UsernameMeView,
)

urlpatterns = [
    # LOGIN (JWT)
    path("login", CustomTokenObtainPairView.as_view(), name="login_token"),

    # REFRESH TOKEN
    path("token/refresh", TokenRefreshView.as_view(), name="token-refresh"),

    # REGISTRO EM 3 PASSOS
    path("register/send-code", RegistrationSendCodeView.as_view(), name="register-send-code"),
    path("register/verify-code", RegistrationVerifyCodeView.as_view(), name="register-verify-code"),
    path("register/complete", RegistrationCompleteView.as_view(), name="register-complete"),

    # RESET DE SENHA
    path("forgot-password", ForgotPasswordView.as_view(), name="forgot-password"),
    path("verify-code", VerifyCodeView.as_view(), name="verify-code"),
    path("reset-password", ResetPasswordView.as_view(), name="reset-password"),

    # USERNAME
    path("username/me", UsernameMeView.as_view(), name="username-me"),
]
