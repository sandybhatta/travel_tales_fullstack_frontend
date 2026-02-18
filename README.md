# Travel Tales - Frontend

**Travel Tales** is a modern, full-stack social media platform designed specifically for travelers. It allows users to document their journeys, create detailed trip itineraries, collaborate with friends, and share their experiences through rich media posts.

This repository contains the **Frontend** application, delivering a responsive, high-performance user interface that interacts with a RESTful backend to provide features like collaborative trip planning, interactive feeds, and real-time social engagement.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- **Secure Access**: User Registration & Login with JWT authentication.
- **Verification**: Email Verification and Reactivation flows.
- **Recovery**: Secure Password Reset via OTP.
- **Session Management**: Automatic token refresh mechanism using Axios interceptors.

### 🌍 Trip Management
- **Comprehensive Planning**: Create trips, manage destinations, track expenses, and maintain to-do lists.
- **Collaboration**: Invite friends to join trips and plan together in real-time.
- **Rich Details**: Specialized views for trip itineraries, notes, and collaborative tools.

### 📱 Social Networking
- **Interactive Feed**: View, like, comment, and share posts from friends and followed travelers.
- **User Connections**: Follow/Unfollow system with "Close Friends" lists.
- **Discovery**: Global search for users, trips, and trending posts.
- **Notifications**: Real-time alerts for interactions and trip invites.

### 💬 Real-time Communication
- **Live Chat**: Instant messaging powered by **Socket.io**.
- **Group Chats**: Create groups for trip planning or general discussion.
- **Seamless Integration**: Chat accessible directly from the navigation bar.

### 👤 Profile System
- **Customizable Profiles**: Update avatars, bios, and personal details.
- **Activity Dashboard**: View stats (Followers, Following, Trips) and activity history.
- **Content Organization**: Dedicated tabs for posts, trips, and saved content.

---

## 🛠️ Tech Stack

This project is built using a modern React ecosystem.

- **Core**: React, Vite
- **Routing**: React Router DOM
- **State Management**: Redux Toolkit, React-Redux
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Icons**: Lucide React, Boxicons
- **Utilities**: ESLint, PostCSS, Autoprefixer

---

## 📂 Project Structure

The project follows a **Feature-Based Architecture**, grouping files by domain for better scalability and maintainability.

```
src/
├── Apis/                   # Centralized API service functions (Auth, Posts, Trips, etc.)
├── AuthenticationComponents/ # Login, Register, OTP, and Password Reset forms
├── ChatComponents/         # Chat UI, logic, and socket integration
├── CustomHooks/            # Reusable hooks (e.g., useDebounceHook)
├── HomeComponents/         # Core dashboard components (Feed, Sidebar, Navbar)
├── LandingPage/            # Public-facing landing page sections
├── PostDetails/            # Individual post views, comments, and interactions
├── ProfileSection/         # User profile management and editing
├── SideBarComponents/      # Utility sidebars (Friends, Suggestions, Invitations)
├── TripDetails/            # Trip planning logic (Expenses, Itinerary, Collaborators)
├── context/                # Global providers (e.g., SocketContext)
├── slices/                 # Redux Toolkit slices for state management
├── utils/                  # Helper functions and logic
├── App.jsx                 # Main application entry point and routing
└── main.jsx                # React DOM rendering
```

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Node.js** (Latest LTS version recommended)
- **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/travel-tales-frontend.git
    cd travel-tales-frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add the following:

    ```bash
    VITE_BACKEND_LIVE_URL=http://localhost:5000
    ```
    > Replace the URL with your actual backend server address if different.

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Previews the production build locally.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

---

## 📞 Contact

**Sandeep Bhatta**  
GitHub: [sandybhatta](https://github.com/sandybhatta)

---

*Built with ❤️ for travelers everywhere.*
