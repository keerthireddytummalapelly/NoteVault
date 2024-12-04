# serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Note


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'user']  
        extra_kwargs = {
            'user': {'read_only': True}  
        }


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'category', 'user','pinned', 'font_size', 'font_style']
        extra_kwargs = {
            'user':{'read_only':True},
            'pinned':{'default':False}
        }