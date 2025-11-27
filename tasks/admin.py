from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "feita", "user", "created_at")
    list_filter = ("feita", "created_at")
    search_fields = ("nome", "descricao", "user__email")
