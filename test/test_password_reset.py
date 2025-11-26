from django.test import TestCase, override_settings
from django.urls import reverse
from django.core import mail
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from rest_framework.test import APIClient

User = get_user_model()

@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class PasswordResetFlowTest(TestCase):
    def setUp(self):
        self.email = 'sdfreitas7@gmail.com'
        self.password = 'SenhaForte123!'
        self.user = User.objects.create_user(email=self.email, password=self.password)
        self.client = APIClient()

    def test_password_reset_request(self):
        url = reverse('password-reset')
        response = self.client.post(url, {'email': self.email})
        self.assertEqual(response.status_code, 200)
        self.assertIn('E-mail de redefinição enviado.', response.json()['detail'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(self.email, mail.outbox[0].to)

    def test_password_reset_request_user_not_found(self):
        url = reverse('password-reset')
        response = self.client.post(url, {'email': 'naoexiste@email.com'})
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('email', data)
        self.assertIn('Usuário com este e-mail não existe.', data['email'][0])

    def test_password_reset_confirm_success(self):
        # Gera token e uid válidos
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        url = reverse('password-reset-confirm', kwargs={'uidb64': uid, 'token': token})
        data = {
            'new_password': 'NovaSenhaForte123!',
            're_new_password': 'NovaSenhaForte123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('Senha redefinida com sucesso.', response.json()['detail'])
        # Verifica se a senha foi realmente alterada
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NovaSenhaForte123!'))

    def test_password_reset_confirm_token_invalido(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        url = reverse('password-reset-confirm', kwargs={'uidb64': uid, 'token': 'tokeninvalido'})
        data = {
            'new_password': 'NovaSenhaForte123!',
            're_new_password': 'NovaSenhaForte123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)
        resp = response.json()
        self.assertIn('detail', resp)
        self.assertIn('Token inválido ou expirado.', resp['detail'])

    def test_password_reset_confirm_senhas_diferentes(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        url = reverse('password-reset-confirm', kwargs={'uidb64': uid, 'token': token})
        data = {
            'new_password': 'NovaSenhaForte123!',
            're_new_password': 'OutraSenha123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)
        resp = response.json()
        self.assertIn('re_new_password', resp)
        self.assertIn('As senhas não coincidem.', resp['re_new_password'][0])

    def test_password_reset_confirm_senha_fraca(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        url = reverse('password-reset-confirm', kwargs={'uidb64': uid, 'token': token})
        data = {
            'new_password': '123',
            're_new_password': '123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)
        resp = response.json()
        self.assertIn('non_field_errors', resp)
        self.assertTrue(any('too short' in err or 'muito curta' in err for err in resp['non_field_errors']))
