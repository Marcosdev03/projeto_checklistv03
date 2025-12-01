from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)
from django.utils import timezone


# ==========================================
# CustomUserManager
# ==========================================
class CustomUserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O e-mail deve ser informado')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser precisa ter is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser precisa ter is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


# ==========================================
# CustomUser
# ==========================================
class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Usuário autenticado por e-mail (USERNAME_FIELD = email).
    """
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


# ==========================================
# PasswordResetCode – fluxo de reset de senha
# ==========================================
class PasswordResetCode(models.Model):
    """
    Fluxo "esqueci minha senha":
      1) Gera código e envia pro e-mail
      2) Valida código e gera temp_token
      3) Troca senha usando temp_token
    """
    email = models.EmailField(max_length=254)
    code = models.CharField(max_length=128)  # hash do código
    temp_token = models.CharField(max_length=64, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def set_code(self, raw_code):
        self.code = make_password(raw_code)

    def check_code(self, raw_code):
        return check_password(raw_code, self.code)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Reset para {self.email}"


# ==========================================
# RegistrationCode – fluxo novo de registro em 3 passos
# ==========================================
class RegistrationCode(models.Model):
    """
    Fluxo de registro:

      PASSO 1: /register/send-code/
        - recebe email
        - gera código
        - salva como hash
        - envia e-mail
        - NÃO cria usuário ainda

      PASSO 2: /register/verify-code/
        - recebe email + código
        - valida
        - gera temp_token

      PASSO 3: /register/complete/
        - recebe email + temp_token + senha
        - cria usuário ativo
        - apaga este registro
    """
    email = models.EmailField(max_length=254, unique=True)
    code = models.CharField(max_length=128)  # código salvo como hash
    temp_token = models.CharField(max_length=64, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def set_code(self, raw_code: str):
        self.code = make_password(raw_code)

    def check_code(self, raw_code: str) -> bool:
        return check_password(raw_code, self.code)

    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Registro pendente para {self.email}"
