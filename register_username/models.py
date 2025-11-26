from django.db import models
from django.conf import settings
from django.utils import timezone

# ============================================================
# UserProfile
# ------------------------------------------------------------
# Modelo responsável por armazenar o username do usuário.
# Mantemos separado do CustomUser para deixar o projeto
# escalável (boa prática de arquitetura).
#
# Cada usuário tem UM profile (OneToOne).
# ============================================================
class UserProfile(models.Model):

    # Relacionamento 1-1 com o usuário principal
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"    # permite acessar como user.profile
    )

    # Nome de exibição do usuário
    # Pode repetir no sistema, pode ser alterado depois.
    username = models.CharField(
        max_length=30,
        null=True,
        blank=True
    )

    # Controle de criação e atualização
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile({self.user.email})"

    # ---------------------------------------------------------
    # Garantir que todo usuário sempre tenha um profile.
    # Se não existir, cria automaticamente.
    # ---------------------------------------------------------
    @staticmethod
    def get_or_create_profile(user):
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile
