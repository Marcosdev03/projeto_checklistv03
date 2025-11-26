from rest_framework.views import APIView
from rest_framework import status, generics
from .serializers import VerifyEmailSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from .models import EmailVerificationCode

from .serializers import (
    RegisterSerializer,
    ForgotPasswordSerializer,
    VerifyCodeSerializer,
    ResetPasswordSerializer,
)
from rest_framework_simplejwt.views import TokenObtainPairView
from .custom_jwt import CustomTokenObtainPairSerializer



# ==========================================
# Registro de usuário
# ==========================================
# authentication/views.py
class RegisterAPI(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Valida dados
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Salva user + gera código + envia email
        user = serializer.save()

        # 🔥 Pega o código gerado (que seu serializer salvou no banco) #apagar em produção

        verification = EmailVerificationCode.objects.get(user=user)

        # Retorno completo para testes no Postman
        return Response(
            {
                "message": "Conta criada com sucesso. Verifique seu e-mail para ativar a conta.",
                "email": user.email,
                "verification_code": verification.code  # 👈 CÓDIGO APARECE AQUI apagar em produção
            },
            status=status.HTTP_201_CREATED
        )



# ==========================================
# 1 - Esqueci minha senha (gera código)
# ==========================================
class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)

        if serializer.is_valid():
            code = serializer.save()
            return Response(
                {"message": "Código enviado para o e-mail informado.", "code": code},# Lembrar de remover "code": code após os testes.
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# 2 - Valida código e gera temp_token
# ==========================================
class VerifyCodeView(APIView):
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
# 3 - Troca senha usando temp_token
# ==========================================
class ResetPasswordView(APIView):
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
# CustomTokenObtainPairView
# ------------------------------------------------------------
# View que substitui o login padrão do SimpleJWT,
# permitindo enviar informações adicionais ao frontend.
# ============================================================
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



# ============================================================
# VerifyEmailView
# Confirma o código enviado no registro e ativa o usuário
# ============================================================
class VerifyEmailView(APIView):
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "E-mail verificado com sucesso! Sua conta está ativa."},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

