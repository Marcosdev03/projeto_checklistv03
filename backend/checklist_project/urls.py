from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.generic import TemplateView


def health(request):
    return JsonResponse({"status": "healthy"})


urlpatterns = [
    path("health/", health, name="health"),
    path("api/auth/", include("authentication.urls")),
    path("api/tasks/", include("tasks.urls")),
    re_path(
        r"^(?!api/|health/|static/).*$",
        TemplateView.as_view(template_name="index.html"),
    ),
]
