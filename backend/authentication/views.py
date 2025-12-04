from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegistrationSendCodeSerializer,
    RegistrationVerifyCodeSerializer,
    RegistrationCompleteSerializer,
    ForgotPasswordSerializer,
    VerifyCodeSerializer,
    ResetPasswordSerializer,
    UsernameSerializer,
)
from .custom_jwt import CustomTokenObtainPairSerializer
from .models import UserProfile


# ==========================================
# REGISTRO – PASSO 1
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
# REGISTRO – PASSO 2
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
# REGISTRO – PASSO 3 + retorno de JWT
# ==========================================
class RegistrationCompleteView(generics.CreateAPIView):
    serializer_class = RegistrationCompleteSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        refresh = RefreshToken.for_user(user)

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
# ESQUECI MINHA SENHA
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
# VALIDAR CÓDIGO DE RESET
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
# RESETAR SENHA COM TEMP_TOKEN
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
# LOGIN – usa seu CustomTokenObtainPairSerializer
# ============================================================
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ============================================================
# USERNAME – /api/authentication/username/me/
# ============================================================
class UsernameMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = UserProfile.get_or_create_profile(request.user)

        return Response({
            "username": profile.username,
            "email": request.user.email,
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UsernameSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            profile = serializer.save()
            return Response({
                "message": "Username atualizado com sucesso.",
                "username": profile.username
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
