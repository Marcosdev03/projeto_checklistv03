from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import random
import re
import uuid
from .models import PasswordResetCode, CustomUser, EmailVerificationCode
import random


User = get_user_model()


# ==========================================
# RegisterSerializer
# Registro de usuário
# ==========================================

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        error_messages={
            "required": "A senha é obrigatória.",
            "blank": "A senha não pode estar vazia.",
            "min_length": "A senha precisa ter pelo menos 8 caracteres.",
        }
    )

    email = serializers.EmailField(
        error_messages={
            "invalid": "Informe um e-mail válido.",
            "required": "O e-mail é obrigatório.",
            "blank": "O e-mail não pode estar vazio."
        }
    )

    class Meta:
        model = CustomUser
        fields = ["email", "password"]

    def validate_password(self, value):
        mensagem = (
            "A senha deve conter pelo menos:\n"
            "- 8 caracteres\n"
            "- 1 letra maiúscula\n"
            "- 1 letra minúscula\n"
            "- 1 número\n"
            "- 1 caractere especial (!@#$%^&*)"
        )

        if len(value) < 8:
            raise serializers.ValidationError(mensagem)
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError(mensagem)
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError(mensagem)
        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError(mensagem)
        if not re.search(r"[!@#$%^&*]", value):
            raise serializers.ValidationError(mensagem)

        return value

    def validate(self, attrs):
        email = attrs.get("email").lower()
        attrs["email"] = email

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": ["E-mail ou senha inválidos."]})

        return attrs

    def create(self, validated_data):
        # 1. Cria o usuário INATIVO
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )
        user.is_active = False
        user.save()

        # 2. Gera o código de verificação
        code = f"{random.randint(100000, 999999)}"


        EmailVerificationCode.objects.update_or_create(
            user=user,
            defaults={"code": code}
        )
        print(f"[DEBUG] Código de verificação enviado para {user.email}: {code}")

        # 3. Envia o código por e-mail
        send_mail(
            subject="Código de verificação da sua conta",
            message=f"Seu código de verificação é: {code}",
            from_email=None,
            recipient_list=[user.email],
        )

        return user



# ==========================================
# ForgotPasswordSerializer
# Gera código de 6 dígitos e envia por e-mail
# ==========================================
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail não está cadastrado.")
        return value

    def save(self):
        email = self.validated_data["email"]

        code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=3)

        PasswordResetCode.objects.create(
            email=email,
            code=code,
            expires_at=expires_at,
        )

        send_mail(
            subject="Seu código para redefinir senha",
            message=f"Seu código é: {code}",
            from_email=None,
            recipient_list=[email],
        )

        return code


# ==========================================
# VerifyCodeSerializer
# Valida código e gera temp_token
# ==========================================
class VerifyCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data["email"]
        code = data["code"]

        try:
            reset = PasswordResetCode.objects.filter(
                email=email, code=code
            ).latest("created_at")
        except PasswordResetCode.DoesNotExist:
            raise serializers.ValidationError({"code": "Código inválido."})

        if reset.is_expired():
            raise serializers.ValidationError({"code": "Código expirado."})

        data["reset_obj"] = reset
        return data

    def save(self):
        reset = self.validated_data["reset_obj"]
        temp_token = uuid.uuid4().hex

        reset.temp_token = temp_token
        reset.save()

        return temp_token


# ==========================================
# ResetPasswordSerializer
# Usa temp_token para trocar a senha
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
# VerifyEmailSerializer
# Confirma o código enviado no registro e ativa o usuário
# ==========================================
# authentication/serializers.py
# ...
# ==========================================
# VerifyEmailSerializer
# Confirma o código enviado no registro e ativa o usuário
# ==========================================
class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True)

    def validate(self, attrs):
        email = attrs.get("email").lower()
        code = attrs.get("code").strip()

        print(f"[DEBUG-REQ] Email Recebido: {email}, Código Recebido: {code}")

        # 1 — Verifica usuário
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Usuário não encontrado."})

        # 2 — Verifica código
        try:
            verification = EmailVerificationCode.objects.get(user=user)
        except EmailVerificationCode.DoesNotExist:
            raise serializers.ValidationError({"code": "Nenhum código foi gerado para este usuário."})

        print(f"[DEBUG-DB] Código no Banco: {verification.code}")

        if str(verification.code).strip() != code:
            raise serializers.ValidationError({"code": "Código inválido."})

        attrs["user"] = user
        attrs["verification"] = verification
        return attrs

    def create(self, validated_data):
        """
        Ativa o usuário e apaga o código.
        """
        user = validated_data["user"]
        verification = validated_data["verification"]

        user.is_active = True
        user.save()

        verification.delete()

        return user
