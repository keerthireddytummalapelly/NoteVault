from django.urls import path
from myapp import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('categories/', views.get_categories, name='get_categories'),
    path('categories/create/', views.create_category, name='create_category'),
    path('notes/', views.get_notes, name='get_notes'),              # GET all notes
    path('notes/create/', views.create_note, name='create_note'),    # POST create note
    path('notes/category/<int:category_id>/', views.get_notes_by_category, name='notes_by_category'), # GET a note from specific category
    path('notes/<int:note_id>/', views.get_note, name='get_note'),   # GET a specific note
    path('notes/update/<int:note_id>/', views.update_note, name='update_note'),  # PUT update note
    path('notes/delete/<int:note_id>/', views.delete_note, name='delete_note'),  # DELETE delete note
]
