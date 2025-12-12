# Email-Reply-Generator
# 📧 Email Writer (AI Powered)

An intelligent email composition assistant powered by AI. This project consists of a high-performance Spring Boot backend and a modern React frontend provided by Vite.

![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)

## 🚀 Technology Stack

### Backend
- **Core**: Java 21, Spring Boot
- **Reactive**: Spring WebFlux
- **Build Tool**: Maven
- **Utilities**: Lombok, Jackson, SLF4J

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Component Library**: Material UI (@mui/material)
- **Networking**: Axios

## 📂 Project Structure

```bash
EMAIL-WRITER/
├── email-writer-backend/demo   # Spring Boot Backend
└── email-writer-react          # React Frontend
```

## 🛠️ Getting Started

Follow these instructions to get the project up and running on your local machine.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd email-writer-backend/demo
    ```

2.  **Build the project:**
    ```bash
    # Windows
    .\mvnw.cmd clean install
    
    # Mac/Linux
    ./mvnw clean install
    ```

3.  **Run the application:**
    ```bash
    # Windows
    .\mvnw.cmd spring-boot:run

    # Mac/Linux
    ./mvnw spring-boot:run
    ```
    The backend server will start on port `8080` (default).

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd email-writer-react
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be accessible at `http://localhost:5173`.

## ✨ Features

- **Smart Composing**: Generate context-aware emails instantly.
- **Modern UI**: Clean, responsive interface built with Material UI.
- **Cross-Platform**: Works seamlessly on all modern browsers.

---
*Created By Pranjal Chaturvedi*
