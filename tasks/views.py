from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

from .models import Task
from .serializers import TaskSerializer


# ================================
# LISTAR e CRIAR TAREFAS
# ================================
class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        cache.delete(f"dashboard_user_{self.request.user.id}")  # invalidar cache


# ================================
# DETALHE, EDITAR e DELETAR
# ================================
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        cache.delete(f"dashboard_user_{self.request.user.id}")

    def perform_destroy(self, instance):
        instance.delete()
        cache.delete(f"dashboard_user_{self.request.user.id}")




class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        cache_key = f"dashboard_user_{user.id}"

        # 1 — tenta pegar do cache
        data = cache.get(cache_key)
        if data:
            return Response(data)

        # 2 — calcula
        tasks = Task.objects.filter(user=user)

        total = tasks.count()
        feitas = tasks.filter(feita=True).count()
        pendentes = total - feitas

        hoje = timezone.now().date()
        semana = hoje - timedelta(days=6)

        tasks_da_semana = (
            tasks.filter(created_at__date__gte=semana)
            .values_list("created_at__week_day", flat=True)
        )

        atividade = {
            "dom": tasks_da_semana.count(1),
            "seg": tasks_da_semana.count(2),
            "ter": tasks_da_semana.count(3),
            "qua": tasks_da_semana.count(4),
            "qui": tasks_da_semana.count(5),
            "sex": tasks_da_semana.count(6),
            "sab": tasks_da_semana.count(7),
        }

        data = {
            "total": total,
            "pendentes": pendentes,
            "feitas": feitas,
            "percentual": round((feitas / total * 100), 2) if total else 0,
            "atividade_semana": atividade,
        }

        # 3 — salva no cache por 30s
        cache.set(cache_key, data, timeout=30)

        return Response(data)
