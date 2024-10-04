from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Category, Note
from .serializers import CategorySerializer, NoteSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# Register User
@api_view(['POST'])
def register(request):
    data = request.data
    try:
        user = User.objects.create_user(username=data['username'], email=data['email'], password=data['password'])
        user.save()
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Get tokens (login)
@api_view(['POST'])
def login(request):
    from rest_framework_simplejwt.views import TokenObtainPairView
    return TokenObtainPairView.as_view()(request._request)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_category(request):
    # Pass the request data to the serializer
    serializer = CategorySerializer(data=request.data)

    if serializer.is_valid():
        # Save the category and assign the user from the request
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # Return a 400 error if validation fails
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Get all categories for the logged-in user (protected)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_categories(request):
    categories = Category.objects.filter(user=request.user)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Protect the route with authentication
def create_note(request):
    title = request.data.get('title')
    content = request.data.get('content')
    category_id = request.data.get('category')  # Ensure categoryId is sent from frontend

    # Check if all fields are provided
    if not title or not content or not category_id:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Fetch the category using category_id
        category = Category.objects.get(id=category_id, user=request.user)
    except Category.DoesNotExist:
        return Response({'error': 'Invalid category'}, status=status.HTTP_400_BAD_REQUEST)

    # Create the note
    note = Note.objects.create(
        title=title,
        content=content,
        category=category,  # Assign the category to the note
        user=request.user
    )
    
    # Serialize and return the created note
    serializer = NoteSerializer(note)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# Get all notes for the logged-in user
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notes(request):
    notes = Note.objects.filter(user=request.user)
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notes_by_category(request, category_id):
    try:
        # Fetch the category by ID for the logged-in user
        category = Category.objects.get(id=category_id, user=request.user)
        
        # Fetch all notes that belong to this category and the authenticated user
        notes = Note.objects.filter(category=category, user=request.user)
        
        # Serialize the notes
        serializer = NoteSerializer(notes, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
    
# Get a specific note by ID
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_note(request, note_id):
    try:
        note = Note.objects.get(id=note_id, user=request.user)
    except Note.DoesNotExist:
        return Response({'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = NoteSerializer(note)
    return Response(serializer.data)

# Update note by ID
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_note(request, note_id):
    try:
        # Check if the note exists and belongs to the authenticated user
        note = Note.objects.get(id=note_id, user=request.user)
    except Note.DoesNotExist:
        return Response({'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)

    # Pass the existing note and updated data to the serializer
    serializer = NoteSerializer(note, data=request.data, partial=True)  # `partial=True` allows updating part of the fields
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete a note by ID
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_note(request, note_id):
    try:
        note = Note.objects.get(id=note_id, user=request.user)
    except Note.DoesNotExist:
        return Response({'message': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)

    note.delete()
    return Response({'message': 'Note deleted successfully'}, status=status.HTTP_200_OK)
