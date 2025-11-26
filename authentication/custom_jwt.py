from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # 1️⃣ Verificar se usuário existe
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed({"detail": "E-mail ou senha incorretos."})

        # 2️⃣ Verificar se usuário está ativo (e-mail verificado)
        if not user.is_active:
            raise AuthenticationFailed(
                {"detail": "Conta não verificada. Verifique seu e-mail para ativá-la."}
            )

        # 3️⃣ Verificar credenciais
        user_auth = authenticate(email=email, password=password)
        if not user_auth:
            raise AuthenticationFailed({"detail": "E-mail ou senha incorretos."})

        # 4️⃣ Login válido → gera access + refresh
        data = super().validate(attrs)

        # 5️⃣ Adiciona informações extras
        profile = getattr(user, "profile", None)
        data["has_username"] = bool(profile and profile.username)
        data["current_username"] = profile.username if profile else None
        data["suggested_username"] = email.split("@")[0]

        return data
