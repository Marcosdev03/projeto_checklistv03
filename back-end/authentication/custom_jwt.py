from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # 1️⃣ Autenticação com email (USERNAME_FIELD = email)
        user = authenticate(email=email, password=password)
        if not user:
            raise AuthenticationFailed({"detail": "E-mail ou senha incorretos."})

        # 2️⃣ Usuário precisa estar ativo
        if not user.is_active:
            raise AuthenticationFailed(
                {"detail": "Conta não verificada. Verifique seu e-mail para ativá-la."}
            )

        # 3️⃣ Gera tokens padrão (access + refresh)
        data = super().validate(attrs)

        # 4️⃣ Informações extras opcionais
        profile = getattr(user, "profile", None)
        data["has_username"] = bool(profile and profile.username)
        data["current_username"] = profile.username if profile else None
        data["suggested_username"] = email.split("@")[0]

        return data
