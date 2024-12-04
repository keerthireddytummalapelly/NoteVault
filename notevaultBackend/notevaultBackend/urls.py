from django.urls import path
from myapp import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', views.index),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('categories/', views.get_categories, name='get_categories'),
    path('categories/create/', views.create_category, name='create_category'),
    path('notes/', views.get_notes, name='get_notes'),              
    path('notes/create/', views.create_note, name='create_note'),    
    path('notes/category/<int:category_id>/', views.get_notes_by_category, name='notes_by_category'), 
    path('notes/<int:note_id>/', views.get_note, name='get_note'),   
    path('notes/update/<int:note_id>/', views.update_note, name='update_note'),  
    path('notes/delete/<int:note_id>/', views.delete_note, name='delete_note'),  
    path('notes/search/', views.search_notes, name='search_notes'), 
    path('categories/update/<int:category_id>/', views.edit_category, name='edit_category'),
    path('categories/delete/<int:category_id>/', views.delete_category, name='delete_category'),
    path('notes/toggle-pin/<int:note_id>/', views.toggle_pin, name='toggle_pin'),  
    path('reset-new-password/', views.reset_new_password, name='reset_new_password'),
    path('summarize/', views.summarize_text, name='summarize'),
    path('check_grammar/', views.check_text, name='check_grammar'),
    path('api/getFirstname/', views.get_firstname, name='get_firstname'),
]
