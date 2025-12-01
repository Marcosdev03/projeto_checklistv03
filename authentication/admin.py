from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Importa o CustomUser + os códigos de verificação
from .models import CustomUser, PasswordResetCode, RegistrationCode

# Importa os forms criados acima
from .forms import CustomUserCreationForm, CustomUserChangeForm


# ============================================================================
# ADMIN DO CustomUser — controla como o usuário aparece no painel
# ============================================================================

class UserAdmin(BaseUserAdmin):
    """
    Admin customizado do usuário.
    """

    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    list_display = ("email", "is_active", "is_staff", "date_joined")
    list_filter = ("is_active", "is_staff")
    ordering = ("email",)

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

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "is_staff", "is_active")
        }),
    )

    search_fields = ("email",)


admin.site.register(CustomUser, UserAdmin)


# ============================================================================
# ADMIN — PASSWORD RESET CODES
# ============================================================================

@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ("email", "code", "created_at", "expires_at")
    search_fields = ("email", "code")


# ============================================================================
# ADMIN — REGISTRATION CODE (fluxo de registro novo)
# ============================================================================

@admin.register(RegistrationCode)
class RegistrationCodeAdmin(admin.ModelAdmin):
    list_display = ("email", "created_at", "expires_at")
    search_fields = ("email",)
