from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User
from myapp.models import Category, Note
from rest_framework_simplejwt.tokens import RefreshToken
from pymongo import MongoClient

class NoteAppTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        """
        Cleanup resources after all tests have run:
        - Close MongoDB connections explicitly to prevent threading issues.
        """
        MongoClient().close()  # Explicitly close the MongoDB connection
        super().tearDownClass()

    def setUp(self):
        """
        Unit-level test setup:
        - Creates a user for authentication and generates a JWT access token.
        - Creates a default category and note for testing category and note functionalities.
        """
        # Create a test user
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="password123")

        # Generate JWT access token for the test user
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
        # Set up the authenticated client with the token
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        # Create a default category and note for testing
        self.category = Category.objects.create(title="Default Category", user=self.user)
        self.note = Note.objects.create(
            title="Default Note", content="This is a default note.", category=self.category, user=self.user
        )

    # ------------------------- User Authentication Tests -------------------------

    def test_register_user_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate user registration functionality with valid data.
        - Software: Tests the `/register/` endpoint to ensure:
            1. User is created successfully.
            2. Access and refresh tokens are returned in the response.
        - Ensures the API correctly handles user creation and token generation.
        """
        # Payload with valid registration data
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword123",
            "first_name": "New",
            "last_name": "User"
        }
        
        # Make a POST request to the /register/ endpoint
        response = self.client.post('/register/', data)
        
        # Assert that the response status is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Assert that access and refresh tokens are returned in the response
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_unsuccessful_registration_missing_fields(self):
        """
        - Test Level: Unit-level test
        - Purpose: Validate error handling for registration with missing required fields.
        - Software: Tests the `/register/` endpoint to ensure:
            1. Missing email and password result in a 400 Bad Request status.
            2. The API provides appropriate error messages for each missing field.
        - Ensures input validation for registration requests is implemented correctly.
        """
        # Payload with only the username, missing email and password
        data = {"username": "newuser"}
        
        # Make a POST request to the /register/ endpoint
        response = self.client.post('/register/', data)
        
        # Assert that the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Assert that the error message is present in the response
        self.assertIn("error", response.data)

    def test_unsuccessful_registration_duplicate_username(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for registration with a duplicate username.
        - Software: Tests the `/register/` endpoint to ensure:
            1. Attempting to register with an existing username results in a 400 Bad Request status.
            2. The API provides a clear error message indicating the duplicate username.
        - Ensures the system enforces unique constraints on usernames during registration.
        """
        # Payload with an existing username but a new email
        data = {"username": "testuser", "email": "newemail@example.com", "password": "password123"}
        
        # Make a POST request to the /register/ endpoint
        response = self.client.post('/register/', data)
        
        # Assert that the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Assert that the error message is present in the response
        self.assertIn("error", response.data)

    def test_login_user_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate login functionality with correct credentials.
        - Software: Tests the `/login/` endpoint to ensure:
            1. User is authenticated successfully.
            2. Access and refresh tokens are returned.
        - Ensures the API handles successful authentication and token generation.
        """
        # Payload with valid login credentials
        response = self.client.post('/login/', {"username": "testuser", "password": "password123"})
        
        # Assert that the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Assert that access and refresh tokens are returned in the response
        self.assertIn("access", response.data)

    def test_login_user_invalid_credentials(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for invalid login credentials.
        - Software: Tests the `/login/` endpoint for:
            1. Authentication failure with incorrect credentials.
            2. Proper error messages in the response.
        - Ensures the API rejects unauthorized access attempts securely.
        """
        # Payload with incorrect password
        response = self.client.post('/login/', {"username": "testuser", "password": "wrongpassword"})
        
        # Assert that the response status is 401 Unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Assert that the error message is present in the response
        self.assertIn("detail", response.data)

    def test_unsuccessful_login_missing_fields(self):
        """
        - Test Level: Unit-level test
        - Purpose: Validate error handling for login with missing required fields.
        - Software: Tests the `/login/` endpoint to ensure:
            1. Missing password results in a 400 Bad Request status.
            2. The API provides a clear error message indicating the missing field.
        - Ensures input validation for login requests is implemented correctly.
        """
        # Payload missing the password field
        response = self.client.post('/login/', {"username": "testuser"})
        
        # Assert that the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Assert that the error message is present in the response
        self.assertIn("password", response.data)

    # ------------------------- Password Reset Tests -------------------------

    def test_reset_password_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate password reset functionality with valid current and new passwords.
        - Software: Tests the /reset-password/ endpoint to ensure:
            1. Current password is validated correctly.
            2. User's password is updated successfully.
        - Ensures that password reset operations work as expected.
        """
        # Payload with correct current password and a new password
        data = {"current_password": "password123", "new_password": "newpassword123"}
        
        # Make a POST request to the /reset-password/ endpoint
        response = self.client.post('/reset-password/', data)
        
        # Assert that the response status is 200 OK indicating successful reset
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh user data from the database to verify changes
        self.user.refresh_from_db()
        
        # Assert that the new password has been updated successfully
        self.assertTrue(self.user.check_password("newpassword123"))

    def test_reset_password_invalid_current_password(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for password reset with an incorrect current password.
        - Software: Tests the /reset-password/ endpoint to ensure:
            1. Password reset is rejected for invalid current password.
            2. Proper error messages are returned.
        - Ensures that the API enforces current password validation during resets.
        """
        # Payload with incorrect current password and a new password
        data = {"current_password": "wrongpassword", "new_password": "newpassword123"}
        
        # Make a POST request to the /reset-password/ endpoint
        response = self.client.post('/reset-password/', data)
        
        # Assert that the response status is 400 Bad Request indicating a validation failure
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # (Optional) Assert that no changes were made to the user's password
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("password123"))  # Original password remains unchanged

    def test_unsuccessful_reset_password_missing_fields(self):
        """
        - Test Level: Unit-level test.
        - Purpose: Validate error handling for password reset with missing required fields.
        - Software: Tests the /reset-password/ endpoint to ensure:
            1. Missing new password results in a 400 Bad Request status.
            2. The API provides a clear error message indicating the missing field.
        - Ensures input validation for password reset requests is implemented correctly.
        """
        # Payload missing the new password field
        data = {"current_password": "password123"}  # Missing new password
        
        # Make a POST request to the /reset-password/ endpoint
        response = self.client.post('/reset-password/', data)
        
        # Assert that the response status is 400 Bad Request indicating validation error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Assert that the response contains a clear error message about the missing field
        self.assertIn("error", response.data)

    # ------------------------- Profile Management Tests -------------------------

    def test_view_profile_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate retrieval of the authenticated user's profile.
        - Software: Tests the `/profile/` endpoint to ensure:
            1. The correct user profile details are returned.
            2. Authentication is required to access the endpoint.
        - Ensures that user-specific data is returned securely.
        """
        # Make a GET request to the `/profile/` endpoint
        response = self.client.get('/profile/')
        
        # Assert that the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Assert that the username in the response matches the authenticated user
        self.assertEqual(response.data["username"], "testuser")

    def test_update_profile_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate the ability to update the authenticated user's profile details.
        - Software: Tests the `/profile/` endpoint to ensure:
            1. Profile updates are persisted to the database.
            2. Validation for proper input fields.
        - Ensures users can successfully update their profile data.
        """
        # Payload with updated email for the profile
        data = {"email": "updated@example.com"}
        
        # Make a PUT request to the `/profile/` endpoint with the payload
        response = self.client.put('/profile/', data)
        
        # Assert that the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Reload the user from the database to ensure changes are persisted
        self.user.refresh_from_db()
        
        # Assert that the updated email matches the provided data
        self.assertEqual(self.user.email, "updated@example.com")

    # ------------------------- Category Management Tests -------------------------

    def test_create_category_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate the ability to create a new category for an authenticated user.
        - Software: Tests the `/categories/create/` endpoint to ensure:
            1. Category is created and associated with the logged-in user.
            2. Input validation is performed.
        - Ensures users can create new categories.
        """
        # Payload with a new category title
        data = {"title": "New Category"}
        
        # Make a POST request to the `/categories/create/` endpoint
        response = self.client.post('/categories/create/', data)
        
        # Assert that the response status is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Assert that the category title in the response matches the provided data
        self.assertEqual(response.data["title"], "New Category")

    def test_delete_category_with_notes(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate the deletion of a category and its associated notes.
        - Software: Tests the `/categories/delete/<id>/` endpoint to ensure:
            1. All notes linked to the category are deleted.
            2. The category is removed from the database.
        - Ensures cascading delete functionality works correctly.
        """
        # Make a DELETE request to remove the category
        response = self.client.delete(f'/categories/delete/{self.category.id}/')
        
        # Assert that the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Assert that the category no longer exists in the database
        self.assertFalse(Category.objects.filter(id=self.category.id).exists())
        
        # Assert that notes associated with the category are also deleted
        self.assertFalse(Note.objects.filter(category=self.category).exists())

    def test_get_categories_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate retrieval of all categories for an authenticated user.
        - Software: Tests the `/categories/` endpoint to ensure:
            1. All categories created by the user are returned.
            2. Authentication is required to access the endpoint.
        - Ensures users can view their own categories securely.
        """
        # Make a GET request to the `/categories/` endpoint
        response = self.client.get('/categories/')
        
        # Assert that the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Assert that the number of categories returned matches the database
        self.assertEqual(len(response.data), 1)  # One category was created in `setUp`

    def test_unsuccessful_create_category_missing_title(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for category creation when the required 'title' field is missing.
        - Software: Tests the `/categories/create/` endpoint to ensure:
            1. The API returns a 400 Bad Request status when required fields are missing.
            2. An appropriate error message is included in the response indicating the missing 'title'.
        - Ensures the input validation for category creation is implemented correctly.
        """
        # Payload missing the title field
        data = {}
        
        # Make a POST request to the `/categories/create/` endpoint
        response = self.client.post('/categories/create/', data)
        
        # Assert that the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Assert that the response contains an error message for the missing 'title'
        self.assertIn("title", response.data)

    def test_unsuccessful_get_notes_by_invalid_category(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for fetching notes by a non-existent category ID.
        - Software: Tests the `/notes/category/<id>/` endpoint to ensure:
            1. A non-existent category ID results in a 404 Not Found status.
            2. An appropriate error message is included in the response indicating the invalid category ID.
        - Ensures the system correctly handles queries for invalid foreign key references.
        """
        # Make a GET request with a non-existent category ID
        response = self.client.get('/notes/category/9999/')  # Non-existent category ID
        
        # Assert that the response status is 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Assert that the response contains an error message for the invalid category
        self.assertIn("error", response.data)

    # ------------------------- Note Management Tests -------------------------
    
    def test_create_note_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate the creation of a note linked to a valid category.
        - Software: Tests the `/notes/create/` endpoint to ensure:
            1. The note is created with correct title, content, and category association.
            2. Input validation is enforced for required fields.
        - Ensures users can add notes to their categories.
        """
        # Payload with valid data for a new note
        data = {"title": "New Note", "content": "This is a new note.", "category": self.category.id}
        
        # Make a POST request to create the note
        response = self.client.post('/notes/create/', data)
        
        # Assert that the note creation returns a 201 Created status
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Assert that the response contains the correct note title
        self.assertEqual(response.data["title"], "New Note")

    def test_get_notes_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate retrieval of all notes for the authenticated user.
        - Software: Tests the `/notes/` endpoint to ensure:
            1. Notes are fetched and returned in the correct format.
            2. Proper filtering by user is applied.
        - Ensures users can view all their notes.
        """
        # Make a GET request to fetch all notes for the user
        response = self.client.get('/notes/')
        
        # Assert that the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Assert that the number of notes returned matches the expected count
        self.assertEqual(len(response.data), 1)  # One note was created in setUp

    def test_get_notes_by_category_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate successful retrieval of notes associated with a specific category.
        - Software: Tests the /notes/category/<id>/ endpoint to ensure:
            1. Notes linked to the specified category ID are fetched and returned in the response.
            2. The response status is 200 OK, indicating successful retrieval.
            3. The returned data includes only the notes related to the given category.
        - Ensures the system correctly implements filtering by category and returns relevant data.
        """
        # Make a GET request to the endpoint for retrieving notes by category ID
        response = self.client.get(f'/notes/category/{self.category.id}/')

        # Assert that the response status is 200 OK, indicating success
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert that the returned data matches the category being queried
        for note in response.data:
            # Check if the note's category matches the queried category ID
            self.assertEqual(note["category"], self.category.id)

    def test_unsuccessful_create_note_invalid_category(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for creating a note with an invalid category ID.
        - Software: Tests the `/notes/create/` endpoint to ensure:
            1. Providing a non-existent category ID results in a 400 Bad Request status.
            2. The response contains an appropriate error message indicating the invalid category.
        - Ensures the system validates foreign key references during note creation.
        """
        # Payload with an invalid category ID
        data = {"title": "Test Note", "content": "This is a test note.", "category": 9999}  # Non-existent category
        
        # Make a POST request to create the note
        response = self.client.post('/notes/create/', data)
        
        # Assert that the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Assert that the error message indicates an invalid category
        self.assertIn("error", response.data)

    def test_get_note_by_id_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate retrieval of a specific note by ID.
        - Software: Tests the `/notes/<id>/` endpoint to ensure:
            1. The correct note is returned based on the ID.
            2. Proper error handling for invalid IDs.
        - Ensures users can view individual notes securely.
        """
        # Make a GET request to retrieve the note by its ID
        response = self.client.get(f'/notes/{self.note.id}/')
        
        # Assert that the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Assert that the title of the note matches the expected value
        self.assertEqual(response.data["title"], "Default Note")

    def test_update_note_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate updating a note's details.
        - Software: Tests the `/notes/update/<id>/` endpoint to ensure:
            1. Updated details are persisted to the database.
            2. Input validation for fields like title and content.
        - Ensures users can modify their notes.
        """
        # Payload with updated title for the note
        data = {"title": "Updated Note"}
        
        # Make a PUT request to update the note by its ID
        response = self.client.put(f'/notes/update/{self.note.id}/', data)
        
        # Assert that the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh the note from the database to verify the update
        self.note.refresh_from_db()
        
        # Assert that the note title has been updated correctly
        self.assertEqual(self.note.title, "Updated Note")

    def test_delete_note_success(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate the deletion of a specific note.
        - Software: Tests the `/notes/delete/<id>/` endpoint to ensure:
            1. The note is removed from the database.
            2. Proper error handling for invalid IDs.
        - Ensures users can remove notes securely.
        """
        # Make a DELETE request to remove the note by its ID
        response = self.client.delete(f'/notes/delete/{self.note.id}/')
        
        # Assert that the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Assert that the note no longer exists in the database
        self.assertFalse(Note.objects.filter(id=self.note.id).exists())

    def test_unsuccessful_get_note_invalid_id(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for fetching a note with a non-existent ID.
        - Software: Tests the `/notes/<id>/` endpoint to ensure:
            1. An invalid note ID results in a 404 Not Found status.
            2. The response contains a meaningful error message indicating the missing note.
        - Ensures the system rejects requests for non-existent resources with clear error messages.
        """
        # Make a GET request with a non-existent note ID
        response = self.client.get('/notes/9999/')
        
        # Assert that the response status is 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Assert that the response contains an error message
        self.assertIn("message", response.data)

    def test_unsuccessful_update_note_invalid_id(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for updating a note with a non-existent ID.
        - Software: Tests the `/notes/update/<id>/` endpoint to ensure:
            1. A non-existent note ID results in a 404 Not Found status.
            2. The response contains a clear error message indicating the invalid resource.
        - Ensures the system prevents updates to non-existent resources and provides proper feedback.
        """
        # Payload with updated title
        data = {"title": "Updated Title"}
        
        # Make a PUT request with a non-existent note ID
        response = self.client.put('/notes/update/9999/', data)
        
        # Assert that the response status is 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Assert that the response contains an error message
        self.assertIn("message", response.data)

    def test_unsuccessful_delete_note_invalid_id(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for deleting a note with a non-existent ID.
        - Software: Tests the `/notes/delete/<id>/` endpoint to ensure:
            1. A non-existent note ID results in a 404 Not Found status.
            2. The response contains a clear error message indicating the invalid note ID.
        - Ensures the system prevents deletion of non-existent resources and provides meaningful error messages.
        """
        # Make a DELETE request with a non-existent note ID
        response = self.client.delete('/notes/delete/9999/')
        
        # Assert that the response status is 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Assert that the response contains an error message
        self.assertIn("message", response.data)

    def test_unsuccessful_create_note_invalid_category(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate error handling for creating a note with an invalid category ID.
        - Software: Tests the `/notes/create/` endpoint to ensure:
            1. Providing a non-existent category ID results in a 400 Bad Request status.
            2. The response contains an appropriate error message indicating the invalid category.
        - Ensures the system validates foreign key references during note creation.
        """
        # Payload with a non-existent category ID
        data = {"title": "Test Note", "content": "This is a test note.", "category": 9999}
        
        # Make a POST request to create a note with an invalid category
        response = self.client.post('/notes/create/', data)
        
        # Assert that the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Assert that the response contains an error message for the invalid category
        self.assertIn("error", response.data)
    

    # ------------------------- Unauthorized Access Tests -------------------------

    def test_unauthorized_access_protection(self):
        """
        - Test Level: Unit-level.
        - Purpose: Validate that protected routes cannot be accessed without authentication.
        - Software: Tests the `/notes/` endpoint to ensure:
            1. Access is denied if no valid token is provided.
            2. The API returns a 401 Unauthorized status with an appropriate error message.
        - Ensures that sensitive data is protected from unauthorized users.
        """
        # Clear the authorization token to simulate an unauthenticated request
        self.client.credentials()

        # Make a GET request to the `/notes/` endpoint without a valid token
        response = self.client.get('/notes/')

        # Assert that the response status is 401 Unauthorized, indicating denied access
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Optional: Check if the response contains a meaningful error message
        self.assertIn("detail", response.data)  # Verify that the error message explains the lack of authentication
