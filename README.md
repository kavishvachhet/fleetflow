# 🚛 FleetFlow - Intelligent Fleet Management System

FleetFlow is a comprehensive, modern, and highly interactive fleet management web application built to streamline operations for Fleet Managers, Dispatchers, Safety Officers, and Financial Analysts. It provides robust Role-Based Access Control (RBAC), intelligent safety metrics, and a beautiful, fully animated user interface.

## ✨ Key Features

*   **🛡️ Role-Based Access Control (RBAC):** Tailored views and permissions for different roles:
    *   **Manager:** Full oversight, vehicle management, and system administration.
    *   **Dispatcher:** Trip dispatching, maintenance logging, and routing.
    *   **Safety Officer:** Dedicated `Safety & Compliance Center` dashboard, driver safety monitoring, and license expiration tracking.
    *   **Financial Analyst:** Expense tracking, cost analysis, and PDF report generation.
*   **🎨 Premium UI / UX:** Built with a stunning "Glassmorphism" aesthetic, featuring frosted-glass panels, smooth gradients, and micro-interactions powered by Framer Motion.
*   **📊 Safety & Compliance Center:** A specialized dashboard that maps out the entire fleet's safety standing, instantly flagging high-risk drivers (Score < 70) and licenses expiring within 30 days.
*   **🌟 Interactive Safety Ratings:** Safety Officers can interactively adjust a driver's safety score post-trip using a custom-built, animated slider modal.
*   **🚚 Intelligent Trip Dispatching:** Real-time business logic blocks trips if a driver's license category doesn't match the vehicle class, or if the cargo exceeds the vehicle's maximum capacity.
*   **💸 Financial Tracking:** Full expense logging and maintenance cost tracking, entirely standardized in Indian Rupees (₹).
*   **📈 Advanced Analytics:** Visualized cost distributions and revenue tracking utilizing Recharts.
*   **🔢 Animated UI Components:** Features like an animated running Odometer, dynamic license plates, and animated avatar badges.

---

## 🛠️ Technology Stack

### Frontend (Client)
*   **Core:** React 19 (via Vite)
*   **Styling:** Tailwind CSS v4 & custom generic CSS for Glassmorphism
*   **Animations:** Framer Motion & Canvas Confetti
*   **Icons:** Lucide React
*   **Visualizations:** Recharts
*   **Routing:** React Router DOM (v7)
*   **HTTP Client:** Axios
*   **Toast Notifications:** Sonner
*   **PDF Generation:** jsPDF & React-to-Print

### Backend (API)
*   **Environment:** Node.js
*   **Framework:** Express.js (v5)
*   **Database:** MongoDB via Mongoose
*   **Authentication:** JWT (JSON Web Tokens) & BcryptJS
*   **Email Services:** Nodemailer
*   **CORS:** Cross-Origin Resource Sharing enabled

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB (cloud or local instance)

### Installation

1.  **Clone the Repository (if applicable)**
2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```
3.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    ```
4.  **Environment Variables:**
    *   Create a `.env` file in the `backend/` directory:
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret_key
        ```
    *   Create a `.env` file in the `frontend/` directory:
        ```env
        VITE_API_URL=http://localhost:5000/api
        ```

### Running the Application Locally

1.  **Start the Backend Server:**
    ```bash
    cd backend
    npm run dev
    ```
    *The server will run on `http://localhost:5000`*

2.  **Start the Frontend Client:**
    ```bash
    cd frontend
    npm run dev
    ```
    *The React application will be available at `http://localhost:5173`*

---

## 🔒 Security

*   Passwords are securely hashed using `bcryptjs` before being stored in the database.
*   API endpoints are protected using a custom `authMiddleware` that verifies JWT tokens.
*   Routes are strictly locked down on both the Frontend (`ProtectedRoute` wrappers) and Backend (`authorize` middleware) to ensure users only execute actions permitted by their role.

---

## 💡 Usage

Upon launching the application, you can log in / sign up using varying roles to experience the different dashboards. For example, registering as a **Safety Officer** instantly overrides the standard fleet dashboard with the dedicated Safety Center.

*Designed with ❤️ for beautiful fleet management.*
