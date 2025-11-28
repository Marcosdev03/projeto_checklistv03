from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Importa o CustomUser + os códigos de verificação
from .models import CustomUser, PasswordResetCode, EmailVerificationCode

# Importa os forms criados acima
from .forms import CustomUserCreationForm, CustomUserChangeForm


# ============================================================================
# ADMIN DO CustomUser — controla como o usuário aparece no painel
# ============================================================================

class UserAdmin(BaseUserAdmin):
    """
    Este admin substitui o padrão do Django para o User,
    permitindo:
    - Criar usuários pelo Admin
    - Editar usuários
    - Mostrar permissões
    - Mostrar email ao invés de username
    """

    # Form usado para criar usuário (com password1 + password2)
    add_form = CustomUserCreationForm

    # Form usado para editar usuário
    form = CustomUserChangeForm

    # Modelo associado
    model = CustomUser

    # Colunas que aparecem na listagem do admin
    list_display = ("email", "is_active", "is_staff", "date_joined")

    # Filtros da barra lateral
    list_filter = ("is_active", "is_staff")

    # Ordenação padrão
    ordering = ("email",)

    # Campos exibidos ao editar um usuário
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Permissões", {
            "fields": (
                "is_staff",
                "is_active",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),
        ("Datas", {"fields": ("last_login", "date_joined")}),
    )

    # Campos exibidos ao criar um novo usuário
    add_fieldsets = (
        (None, {
            "classes": ("wide",),  # deixa mais bonito
            "fields": ("email", "password1", "password2", "is_staff", "is_active")
        }),
    )

    # Permite buscar por email
    search_fields = ("email",)


# Registra o CustomUser com o UserAdmin customizado
admin.site.register(CustomUser, UserAdmin)



# ============================================================================
# ADMIN — PASSWORD RESET CODES
# ============================================================================

@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    """
    Permite visualizar e buscar códigos de reset de senha.
    Útil para debug.
    """
    list_display = ("email", "code", "created_at", "expires_at")
    search_fields = ("email", "code")



# ============================================================================
# ADMIN — EMAIL VERIFICATION CODE
# ============================================================================

@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    """
    Admin para visualizar códigos de verificação de e-mail.
    """
    list_display = ("user", "code", "created_at")
    search_fields = ("user__email", "code")
