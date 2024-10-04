# NoteVault

### Project Overview
NoteVault is a full-stack application designed for creating, managing, and categorizing notes. The frontend is built using React, and the backend is powered by Django REST Framework with MongoDB for data storage.

### Features
1. User authentication (Login, Signup, Logout)
2. Create, update, delete notes
3. Categorize notes
4. Pin/Unpin notes for easy access

### Technologies Used
Frontend:
1. React.js (with React Router for navigation)
2. TailwindCSS (for styling)
3. Framer Motion (for animations)

Backend:
1. Django
2. Django REST Framework
3. MongoDB (via Djongo)


### Setup Instructions

Clone the Repository

```
git clone https://github.com/yourusername/notevault.git
cd notevault
```

#### Frontend (React): 

Navigate to the Frontend Directory and Install Dependencies
```
cd frontend
npm install
```

Run the Development Server
```
npm start
```
This will run the React app at http://localhost:3000.


#### Backend (Django):

Navigate to the Backend Directory
```
cd ../notevaultBackend
```

Install Python Dependencies
```
pip install -r requirements.txt
```

Set Up the Environment Variables 
```
DATABASE_URL=mongodb+srv://<your_mongodb_cluster>
```

Run Database Migrations
```
python manage.py makemigrations
python manage.py migrate
```

Start the Django Development Server
```
python manage.py runserver
```

This will run the backend server at http://localhost:8000.