from django.test import SimpleTestCase
from django.urls import resolve, reverse


class DeploymentRoutesTest(SimpleTestCase):
    def test_health_endpoint_is_available(self):
        self.assertEqual(reverse("health"), "/health/")

    def test_frontend_authentication_prefix_is_available(self):
        match = resolve("/api/authentication/login")

        self.assertEqual(match.url_name, "login_token")
