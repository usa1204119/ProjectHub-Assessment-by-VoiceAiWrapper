# 🚀 Project Hub – GraphQL Project Management Dashboard

A full-stack Project Management Dashboard built with **Django + GraphQL (Graphene)** on the backend and **React + Apollo Client + Tailwind CSS** on the frontend.

This application demonstrates real-world GraphQL usage, Apollo cache management, and a modern UI for managing organizations, projects, tasks, and comments.

---

## 🎯 Project Objective

The goal of this project is to demonstrate:

- **Practical GraphQL API design** (queries + mutations)
- **Clean data relationships** (Organization → Project → Task → Comment)
- **Live UI updates** without page refresh using Apollo Cache
- **Production-style frontend** using React and Tailwind CSS
- **Proper separation** of backend and frontend concerns

### This is not just CRUD — it showcases:

- ✨ Optimistic UI updates
- 🔄 Cache synchronization
- 🧩 Component-driven UI architecture
- 📈 Scalable schema design

---

## 🧠 Key Features

### ✅ Backend (GraphQL API)

- **Organizations**
- **Projects** under organizations
- **Tasks** under projects
- **Comments** under tasks

### ✅ GraphQL Operations

**Queries:**
- Fetch all organizations with nested projects, tasks, and comments

**Mutations:**
- Create Project
- Rename Project
- Create Task
- Update Task Status (TODO → DONE)
- Create Comment
- Delete Comment

> All mutations return structured GraphQL payloads.

### ✅ Frontend (React + Apollo)

- 🎨 Dashboard UI with dark theme
- 📋 Project cards with status badges
- ✅ Task management panel
- 💬 Comment dropdown per task
- ⚡ Live updates without refresh
- 🚀 Optimistic updates for task status
- 🔄 Apollo cache updates for:
  - Project creation
  - Task creation
  - Comment creation
  - Comment deletion

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Python | Core language |
| Django | Web framework |
| Graphene-Django | GraphQL integration |
| SQLite | Database |
| GraphQL | API query language |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React (Vite) | UI framework |
| Apollo Client | GraphQL client |
| GraphQL | Data fetching |
| Tailwind CSS v4 | Styling |
| TypeScript | Type safety |

---

## ▶️ How to Run the Project

### 1️⃣ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**GraphQL Playground** will be available at:  
👉 http://localhost:8000/graphql/

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend** will run at:  
👉 http://localhost:5173

---

## 🧪 GraphQL Test Cases

### Query: Fetch Full Data Tree

```graphql
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
```

---

### Mutation: Create Project

```graphql
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
```

---

### Mutation: Create Task

```graphql
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
```

---

### Mutation: Update Task Status

```graphql
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
```

---

### Mutation: Create Comment

```graphql
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
```

---

### Mutation: Delete Comment

```graphql
mutation {
  deleteComment(commentId: "1") {
    success
  }
}
```

---

## 📚 Project Structure

```
project-hub/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

---

## ✅ What This Project Demonstrates

| Feature | Implementation |
|---------|---------------|
| GraphQL Schema Design | Proper type definitions and resolvers |
| Nested Data Querying | Deep relationship traversal |
| Mutation-Driven Updates | State management through GraphQL |
| Apollo Cache Manipulation | Efficient client-side caching |
| Optimistic UI Updates | Instant user feedback |
| Clean UI/UX | Professional design with Tailwind |
| Full-Stack Architecture | Realistic production patterns |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Your Name - [Your GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Built with ❤️ using Django, GraphQL, and React
- Inspired by modern project management tools

---

**⭐ If you find this project helpful, please give it a star!**
