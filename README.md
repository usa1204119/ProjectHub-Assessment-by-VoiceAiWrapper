🚀 Project Hub – GraphQL Project Management Dashboard

A full-stack Project Management Dashboard built with Django + GraphQL (Graphene) on the backend and React + Apollo Client + Tailwind CSS on the frontend.

This application demonstrates real-world GraphQL usage, Apollo cache management, and a modern UI for managing organizations, projects, tasks, and comments.

🎯 Project Objective

The goal of this project is to demonstrate:

Practical GraphQL API design (queries + mutations)

Clean data relationships (Organization → Project → Task → Comment)

Live UI updates without page refresh using Apollo Cache

A production-style frontend using React and Tailwind CSS

Proper separation of backend and frontend concerns

This is not just CRUD — it showcases:

Optimistic UI updates

Cache synchronization

Component-driven UI architecture

Scalable schema design

🧠 Key Features (All Implemented)
✅ Backend (GraphQL API)

Organizations

Projects under organizations

Tasks under projects

Comments under tasks

✅ GraphQL Operations
Queries

Fetch all organizations with nested projects, tasks, and comments

Mutations

Create Project

Rename Project

Create Task

Update Task Status (TODO → DONE)

Create Comment

Delete Comment

All mutations return structured GraphQL payloads.

✅ Frontend (React + Apollo)

Dashboard UI with dark theme

Project cards with status badges

Task management panel

Comment dropdown per task

Live updates without refresh

Optimistic updates for task status

Apollo cache updates for:

Project creation

Task creation

Comment creation

Comment deletion



🛠️ Tech Stack
Backend

Python

Django

Graphene-Django

SQLite

GraphQL

Frontend

React (Vite)

Apollo Client

GraphQL

Tailwind CSS v4

TypeScript

▶️ How to Run the Project
1️⃣ Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


GraphQL Playground will be available at:

http://localhost:8000/graphql/

2️⃣ Frontend Setup
cd frontend
npm install
npm run dev


Frontend will run at:

http://localhost:5173

🧪 GraphQL Test Cases (Example)
Query: Fetch Full Data Tree
query {
  organizations {
    id
    name
    slug
    projects {
      id
      name
      status
      tasks {
        id
        title
        status
        comments {
          id
          content
        }
      }
    }
  }
}

Mutation: Create Project
mutation {
  createProject(
    organizationSlug: "my-organization"
    name: "New Project"
  ) {
    project {
      id
      name
      status
    }
  }
}

Mutation: Create Task
mutation {
  createTask(
    projectId: "1"
    title: "Setup GraphQL schema"
  ) {
    task {
      id
      title
      status
    }
  }
}

Mutation: Update Task Status
mutation {
  updateTaskStatus(
    taskId: "1"
    status: "DONE"
  ) {
    task {
      id
      status
    }
  }
}

Mutation: Create Comment
mutation {
  createComment(
    taskId: "1"
    content: "Schema looks clean"
  ) {
    comment {
      id
      content
    }
  }
}

Mutation: Delete Comment
mutation {
  deleteComment(commentId: "1") {
    success
  }
}

✅ What This Project Demonstrates

Proper GraphQL schema design

Nested data querying

Mutation-driven state updates

Apollo cache manipulation

Optimistic UI updates

Clean UI/UX with Tailwind

Realistic full-stack architecture
