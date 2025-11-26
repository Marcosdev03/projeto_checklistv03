from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import serializers 
from authentication.serializers import RegisterSerializer

CustomUser = get_user_model() 

class RegisterSerializerTest(TestCase):
    def setUp(self):
        CustomUser.objects.all().delete()
        
    def test_valid_user_creation(self):
        valid_data = {
            'email': 'usuario@valido.com',
            'password': 'senhaforte1234'
        }
        serializer = RegisterSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, 'usuario@valido.com')
        self.assertTrue(CustomUser.objects.filter(email='usuario@valido.com').exists())
        self.assertTrue(user.check_password('senhaforte1234'))

    def test_duplicate_email_failure(self):
        CustomUser.objects.create_user(email='teste@duplicado.com', password='senhaforte1234')
        duplicate_data = {
            'email': 'teste@duplicado.com',
            'password': 'outrasenha5678'
        }
        serializer = RegisterSerializer(data=duplicate_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
        self.assertIn('Este e-mail já está em uso.', serializer.errors['email'][0])

    def test_short_password_failure(self):
        invalid_data = {
            'email': 'usuario@curto.com',
            'password': 'curta'
        }
        serializer = RegisterSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
        self.assertIn('A senha deve ter pelo menos 8 caracteres.', serializer.errors['password'][0])
