from django.db import models
from django.conf import settings
from django.utils import timezone


class Task(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks"
    )
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    feita = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.nome} ({'Feita' if self.feita else 'Pendente'})"
