# 🗂️ FlowBoard — Team Task Manager

<div align="center">

![FlowBoard Banner](https://img.shields.io/badge/FlowBoard-Team%20Task%20Manager-6C63FF?style=for-the-badge&logo=trello&logoColor=white)

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-6C63FF?style=flat-square)](https://flowboard-production-1be0.up.railway.app/login)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Railway](https://img.shields.io/badge/Deployed%20on-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.app/)

**A full-stack collaborative task management platform for teams — organize, track, and complete work together.**

[**→ Try it Live**](https://flowboard-production-1be0.up.railway.app/login)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## 🧭 Overview

FlowBoard is a full-stack **team task management application** inspired by tools like Trello and Jira. It enables teams to collaborate in real time — create boards, manage tasks across multiple stages, assign work, and track progress through a clean, intuitive Kanban-style interface.

Built with the **MERN stack** and deployed on **Railway**, FlowBoard is designed to be fast, scalable, and accessible from any device.

---

## ✨ Features

- 🔐 **User Authentication** — Secure registration and login with session management
- 📋 **Board Management** — Create, update, and delete project boards
- 🗃️ **Kanban Task Flow** — Organize tasks across customizable columns (To Do → In Progress → Done)
- ✅ **Task CRUD** — Add, edit, delete, and reorder tasks with ease
- 👥 **Team Collaboration** — Assign tasks to team members and track ownership
- 🏷️ **Labels & Priorities** — Tag tasks with priorities and categories for better organization
- 📱 **Responsive UI** — Fully optimized for desktop, tablet, and mobile screens
- 🚀 **Live Deployment** — Hosted and accessible anytime via Railway

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, HTML5, CSS3, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT / Express Sessions |
| **Version Control** | Git, GitHub |
| **Deployment** | Railway |
| **Tools** | VS Code, Postman |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas URI)
- [Git](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/flowboard.git
cd flowboard

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies (if separate)
cd client
npm install
cd ..
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Running the App

```bash
# Run backend server
npm start

# Run frontend (in a separate terminal, if applicable)
cd client
npm start
```

Visit `http://localhost:8080` in your browser.

---

## 📁 Project Structure

```
flowboard/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page-level components
│       ├── context/         # Global state management
│       └── App.js
├── controllers/             # Route handler logic
├── models/                  # Mongoose schemas
├── routes/                  # Express route definitions
├── middleware/              # Auth & error middleware
├── config/                  # DB connection config
├── .env                     # Environment variables (not committed)
├── app.js                   # Express app setup
└── package.json
```

---

## 🌐 Live Demo

The application is live and deployed on Railway:

**🔗 [https://flowboard-production-1be0.up.railway.app/login](https://flowboard-production-1be0.up.railway.app/login)**

---

## 👨‍💻 Author

**Shourya Yadav**

B.Tech in Computer Science & Engineering (AI/ML Specialization)
Ajay Kumar Garg Engineering College, 2022–2026

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/your-profile)

---

<div align="center">
  <sub>Made with ❤️ by Shourya Yadav</sub>
</div>
