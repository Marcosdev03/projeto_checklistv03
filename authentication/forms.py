from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.contrib.auth import get_user_model

# Importa o modelo de usuário customizado
User = get_user_model()


# ============================================================================
# FORM PARA CRIAÇÃO DE USUÁRIO NO ADMIN
# ============================================================================

class CustomUserCreationForm(forms.ModelForm):
    """
    Este form é usado APENAS dentro do Django Admin
    para criar novos usuários do modelo CustomUser.
    Ele adiciona dois campos extras: password1 e password2.
    """

    # Campo de senha (primeira digitação)
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)

    # Campo de senha (confirmação)
    password2 = forms.CharField(label="Confirm password", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email",)  # Apenas email aparece no cadastro

    def clean_password2(self):
        """
        Valida se password1 e password2 são iguais.
        """
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("As senhas não coincidem.")

        return password2

    def save(self, commit=True):
        """
        Salva o usuário com a senha criptografada.
        """
        user = super().save(commit=False)

        # Define a senha usando hashing do Django
        user.set_password(self.cleaned_data["password1"])

        # Se quiser que o usuário já nasça ativo, descomente aqui:
        # user.is_active = True

        if commit:
            user.save()

        return user


# ============================================================================
# FORM PARA ALTERAÇÃO DE USUÁRIO NO ADMIN
# ============================================================================

class CustomUserChangeForm(forms.ModelForm):
    """
    Form usado para editar um usuário no Django Admin.
    O campo de senha é exibido como 'somente leitura', pois não é editado direto.
    """

    # Exibe a senha criptografada como campo read-only
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ("email", "password", "is_active", "is_staff")

    def clean_password(self):
        return self.initial["password"]
