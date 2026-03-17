from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import logging
import re
import uuid
import random

from .models import (
    PasswordResetCode,
    CustomUser,
    RegistrationCode,
    UserProfile,
)

User = get_user_model()
logger = logging.getLogger(__name__)


def _extract_email_error_message(exc: Exception) -> str:
    detail = getattr(exc, "args", None)
    if detail and isinstance(detail, tuple) and detail[0]:
        return str(detail[0])
    return "Nao foi possivel enviar o e-mail agora. Tente novamente mais tarde."


def _send_code_email(subject: str, message: str, recipient: str) -> None:
    backend = getattr(settings, "EMAIL_BACKEND", "")
    is_console_backend = backend.endswith("console.EmailBackend")

    # SMTP backend requires host and user configured. If missing, this route should
    # fail as a validation error instead of exploding with HTTP 500.
    if not is_console_backend and (not getattr(settings, "EMAIL_HOST", "") or not getattr(settings, "EMAIL_HOST_USER", "")):
        raise serializers.ValidationError(
            {"email": "Servico de e-mail indisponivel. Configure SMTP para continuar."}
        )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=None,
            recipient_list=[recipient],
        )
        return
    except Exception as exc:
        logger.exception("Falha ao enviar e-mail para %s", recipient)
        raise serializers.ValidationError({"email": _extract_email_error_message(exc)})


# ==========================================
# REGISTRO – PASSO 1 (send-code)
# ==========================================
class RegistrationSendCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.lower()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")

        return email

    def save(self):
        email = self.validated_data["email"].lower()

        raw_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=10)

        registration, _ = RegistrationCode.objects.update_or_create(
            email=email,
            defaults={"expires_at": expires_at}
        )

        registration.set_code(raw_code)
        registration.temp_token = None
        registration.save()

        _send_code_email(
            subject="Codigo para criar sua conta",
            message=f"Seu codigo de verificacao e: {raw_code}",
            recipient=email,
        )

        return registration


# ==========================================
# REGISTRO – PASSO 2 (verify-code)
# ==========================================
class RegistrationVerifyCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data["email"].lower()
        raw_code = data["code"].strip()

        try:
            registration = RegistrationCode.objects.get(email=email)
        except RegistrationCode.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "Nenhum código foi enviado para este e-mail."}
            )

        if registration.is_expired():
            raise serializers.ValidationError({"code": "Código expirado."})

        if not registration.check_code(raw_code):
            raise serializers.ValidationError({"code": "Código inválido."})

        data["registration_obj"] = registration
        return data

    def save(self):
        registration = self.validated_data["registration_obj"]
        temp_token = uuid.uuid4().hex

        registration.temp_token = temp_token
        registration.save()

        return temp_token


# ==========================================
# REGISTRO – PASSO 3 (complete)
# ==========================================
class RegistrationCompleteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    temp_token = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        mensagem = (
            "A senha deve conter:\n"
            "- 8 caracteres\n"
            "- 1 letra maiúscula\n"
            "- 1 letra minúscula\n"
            "- 1 número\n"
            "- 1 caractere especial (!@#$%^&*)"
        )

        if len(value) < 8 or \
                not re.search(r"[A-Z]", value) or \
                not re.search(r"[a-z]", value) or \
                not re.search(r"[0-9]", value) or \
                not re.search(r"[!@#$%^&*]", value):
            raise serializers.ValidationError(mensagem)

        return value

    def validate(self, attrs):
        email = attrs.get("email").lower()
        temp_token = attrs.get("temp_token")

        try:
            registration = RegistrationCode.objects.get(email=email, temp_token=temp_token)
        except RegistrationCode.DoesNotExist:
            raise serializers.ValidationError(
                {"temp_token": "Token inválido ou já utilizado."}
            )

        if registration.is_expired():
            raise serializers.ValidationError(
                {"temp_token": "Token expirado, solicite um novo código."}
            )

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"email": "Este e-mail já está cadastrado."}
            )

        attrs["registration_obj"] = registration
        attrs["email"] = email
        return attrs

    def create(self, validated_data):
        registration = validated_data["registration_obj"]
        email = validated_data["email"]
        password = validated_data["password"]

        user = User.objects.create_user(
            email=email,
            password=password,
        )
        user.is_active = True
        user.save()

        # username sugerido
        suggested_username = email.split("@")[0]

        # garante profile — MAS NÃO DEFINE USERNAME
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)

        # deixa username como NULL
        profile.username = None
        profile.save()

        registration.delete()

        return user


# ==========================================
# ESQUECI MINHA SENHA – gera código
# ==========================================
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail não está cadastrado.")
        return value

    def save(self):
        email = self.validated_data["email"]

        raw_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=3)

        reset = PasswordResetCode(
            email=email,
            expires_at=expires_at,
        )
        reset.set_code(raw_code)
        reset.save()

        _send_code_email(
            subject="Seu codigo para redefinir senha",
            message=f"Seu codigo e: {raw_code}",
            recipient=email,
        )

        return raw_code


# ==========================================
# RESET – valida código e gera temp_token
# ==========================================
class VerifyCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data["email"]
        raw_code = data["code"]

        try:
            reset = PasswordResetCode.objects.filter(email=email).latest("created_at")
        except PasswordResetCode.DoesNotExist:
            raise serializers.ValidationError({"code": "Código inválido."})

        if reset.is_expired():
            raise serializers.ValidationError({"code": "Código expirado."})

        if not reset.check_code(raw_code):
            raise serializers.ValidationError({"code": "Código inválido."})

        data["reset_obj"] = reset
        return data

    def save(self):
        reset = self.validated_data["reset_obj"]
        temp_token = uuid.uuid4().hex

        reset.temp_token = temp_token
        reset.save()

        return temp_token


# ==========================================
# RESET – troca senha com temp_token
# ==========================================
class ResetPasswordSerializer(serializers.Serializer):
    temp_token = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})

        validate_password(data["password"])
        return data

    def save(self):
        temp_token = self.validated_data["temp_token"]
        password = self.validated_data["password"]

        try:
            reset = PasswordResetCode.objects.get(temp_token=temp_token)
        except PasswordResetCode.DoesNotExist:
            raise serializers.ValidationError({"temp_token": "Token inválido."})

        user = User.objects.get(email=reset.email)
        user.set_password(password)
        user.save()

        reset.delete()

        return user


# ==========================================
# USERNAME – mesma lógica da rota antiga
# ==========================================
class UsernameSerializer(serializers.Serializer):
    username = serializers.CharField(
        allow_blank=True,
        allow_null=True,
        required=False
    )

    def validate_username(self, value):
        if not value:
            return value

        value = value.strip()

        if len(value) < 3 or len(value) > 30:
            raise serializers.ValidationError(
                "O username deve ter entre 3 e 30 caracteres."
            )

        if any(ch in value for ch in "<>/\\"):
            raise serializers.ValidationError(
                "O username contém caracteres inválidos."
            )

        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        email = user.email

        profile = UserProfile.get_or_create_profile(user)

        username = self.validated_data.get("username")

        if not username:
            username = email.split("@")[0]

        profile.username = username
        profile.save()

        return profile
