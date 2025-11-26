from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)
from django.utils import timezone


# ==========================================
# CustomUserManager
# Gerenciador responsável por criar usuários comuns e superusuários.
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

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser precisa ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser precisa ter is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


# ==========================================
# CustomUser
# Modelo customizado de usuário (login via email)
# ==========================================
class CustomUser(AbstractBaseUser, PermissionsMixin):
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
# PasswordResetCode
# Armazena códigos de reset por e-mail
# ==========================================
class PasswordResetCode(models.Model):
    email = models.EmailField(max_length=254)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    temp_token = models.CharField(max_length=255, null=True, blank=True)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Reset code for {self.email} ({self.code})"


# ==========================================
# Verifica o e-mail para criação de conta
# ==========================================
class EmailVerificationCode(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="email_verification"
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Verification code for {self.user.email}: {self.code}"