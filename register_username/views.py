from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile
from .serializers import UsernameSerializer

# ============================================================
# UsernameMeView
# ------------------------------------------------------------
# Endpoint principal do módulo:
#
# GET  → retorna estado do username do usuário logado
# POST → cria ou atualiza o username do usuário logado
#
# Sempre exige JWT (IsAuthenticated)
# Nunca deixa cliente informar ID de usuário
# Sempre usa request.user
# ============================================================
class UsernameMeView(APIView):

    # Exige autenticação
    permission_classes = [IsAuthenticated]

    # ---------------------------------------------------------
    # GET → retorna:
    # has_username
    # current_username
    # suggested_username (nome antes do @)
    # ---------------------------------------------------------
    def get(self, request):
        user = request.user

        # Garante que o usuário tem um profile
        profile = UserProfile.get_or_create_profile(user)

        # Sugestão automática baseada no email
        suggested = user.email.split("@")[0]

        return Response({
            "has_username": bool(profile.username),
            "current_username": profile.username,
            "suggested_username": suggested,
        })

    # ---------------------------------------------------------
    # POST → salva o username enviado ou usa a sugestão
    # ---------------------------------------------------------
    def post(self, request):
        serializer = UsernameSerializer(
            data=request.data,
            context={"request": request}  # necessário para pegar user
        )

        if serializer.is_valid():
            profile = serializer.save()
            return Response({
                "message": "Username definido com sucesso.",
                "username": profile.username
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
