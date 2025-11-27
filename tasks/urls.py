from django.urls import path
from .views import (
    TaskListCreateView,
    TaskDetailView,
    DashboardView
)

urlpatterns = [
    path("", TaskListCreateView.as_view(), name="tasks"),
    path("<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("dashboard/", DashboardView.as_view(), name="task-dashboard"),
]
