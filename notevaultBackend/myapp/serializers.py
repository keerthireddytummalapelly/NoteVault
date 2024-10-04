# serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Note

# Serializer for the User model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# Serializer for the Category model
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'user']  # Include 'user' to show who created the category
        extra_kwargs = {
            'user': {'read_only': True}  # Make 'user' field read-only
        }

# Note Serializer
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'category', 'user']