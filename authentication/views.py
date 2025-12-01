from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegistrationSendCodeSerializer,
    RegistrationVerifyCodeSerializer,
    RegistrationCompleteSerializer,
    ForgotPasswordSerializer,
    VerifyCodeSerializer,
    ResetPasswordSerializer,
)
from .custom_jwt import CustomTokenObtainPairSerializer


# ==========================================
# FLUXO NOVO – PASSO 1
# Enviar código de registro
# ==========================================
class RegistrationSendCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSendCodeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Código enviado para o e-mail informado."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# FLUXO NOVO – PASSO 2
# Validar código e gerar temp_token
# ==========================================
class RegistrationVerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationVerifyCodeSerializer(data=request.data)
        if serializer.is_valid():
            temp_token = serializer.save()
            return Response(
                {"temp_token": temp_token},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# FLUXO NOVO – PASSO 3
# Completar registro, criar usuário e já devolver JWT
# ==========================================
class RegistrationCompleteView(generics.CreateAPIView):
    serializer_class = RegistrationCompleteSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()  # cria usuário ativo

        # Gera tokens JWT (access + refresh)
        refresh = RefreshToken.for_user(user)

        # Extras parecidos com CustomTokenObtainPairSerializer
        profile = getattr(user, "profile", None)
        has_username = bool(profile and getattr(profile, "username", None))
        current_username = getattr(profile, "username", None) if profile else None
        suggested_username = user.email.split("@")[0]

        return Response(
            {
                "message": "Conta criada com sucesso!",
                "email": user.email,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "has_username": has_username,
                "current_username": current_username,
                "suggested_username": suggested_username,
            },
            status=status.HTTP_201_CREATED
        )


# ==========================================
# Esqueci minha senha – gera código
# ==========================================
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Código enviado para o e-mail informado."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# Reset de senha – valida código e gera temp_token
# ==========================================
class VerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyCodeSerializer(data=request.data)

        if serializer.is_valid():
            temp_token = serializer.save()
            return Response(
                {"temp_token": temp_token},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# Reset de senha – troca usando temp_token
# ==========================================
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Senha redefinida com sucesso."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# LOGIN – CustomTokenObtainPairView com seu serializer
# ============================================================
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
