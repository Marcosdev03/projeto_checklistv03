import re
from rest_framework import serializers
from .models import UserProfile

# ============================================================
# UsernameSerializer
# ------------------------------------------------------------
# Responsável por validar e salvar o username escolhido pelo
# usuário autenticado.
#
# - Permite string vazia → backend gera username automático
# - Bloqueia apenas caracteres perigosos (< > \ /)
# - Permite atualização futura
# ============================================================
class UsernameSerializer(serializers.Serializer):

    # Campo opcional, pode vir vazio
    username = serializers.CharField(
        allow_blank=True,
        allow_null=True,
        required=False
    )

    # ---------------------------------------------------------
    # Validação do username
    # ---------------------------------------------------------
    def validate_username(self, value):

        # Se usuário não enviou nada → backend gera automaticamente
        if not value:
            return value

        # Remove espaços extras
        value = value.strip()

        # Regras de tamanho
        if len(value) < 3 or len(value) > 30:
            raise serializers.ValidationError(
                "O username deve ter entre 3 e 30 caracteres."
            )

        # Bloqueia caracteres perigosos
        if any(ch in value for ch in "<>/\\"):
            raise serializers.ValidationError(
                "O username contém caracteres inválidos."
            )

        return value

    # ---------------------------------------------------------
    # Salva (ou atualiza) o username
    # ---------------------------------------------------------
    def save(self, **kwargs):
        user = self.context["request"].user
        email = user.email

        # Garante que o profile exista
        profile = UserProfile.get_or_create_profile(user)

        # Username enviado
        username = self.validated_data.get("username")

        # Se usuário enviou vazio, gera automaticamente baseado no e-mail
        if not username:
            username = email.split("@")[0]

        # Salvar no banco
        profile.username = username
        profile.save()

        return profile
