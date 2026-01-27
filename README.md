# Travel Tales - Frontend

## 1. Project Overview

**Travel Tales** is a modern, full-stack social media platform designed specifically for travelers. It allows users to document their journeys, create detailed trip itineraries, and share their experiences through rich media posts.

This repository contains the **Frontend** application, built with **React 19** and **Vite**. It delivers a responsive, high-performance user interface that interacts with a RESTful backend to provide features like collaborative trip planning, interactive feeds, and real-time social engagement.

The application focuses on a "mobile-first" responsive design and implements complex state management for handling user sessions, multi-step forms, and optimistic UI updates.

## 2. Live Demo

- **Production URL**: [https://traveltales-demo.vercel.app](https://traveltales-demo.vercel.app) *(Placeholder)*
- **Staging URL**: [https://traveltales-staging.vercel.app](https://traveltales-staging.vercel.app) *(Placeholder)*

## 3. Features

- **Authentication**: Secure User Registration, Login, OTP Verification, and Password Recovery.
- **Trip Management**:
    - Create and manage detailed itineraries.
    - **Collaboration**: Invite friends to plan trips together.
    - Tools: Expense tracking, To-do lists, and shared Notes.
- **Social Feed**:
    - Universal feed showing posts from followed users and popular content.
    - Rich media support (images/videos) for travel stories.
    - Like, Comment (with nested replies), and Share functionality.
- **Profile System**:
    - Customizable user profiles with avatars and bios.
    - "Close Friends" lists and privacy settings.
    - Activity logs (Liked posts, Trip history).
- **Search & Discovery**:
    - Global search for Users, Trips, and Posts.
    - Search history management.

## 4. Tech Stack

- **Core**: [React 19](https://react.dev/) (Latest)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 5. Frontend Architecture Overview

The project follows a **Feature-Based Architecture**. Instead of grouping files by type (e.g., all components in one folder), files are grouped by the specific feature or domain they belong to (e.g., `TripDetails`, `PostDetails`). This improves maintainability and makes the codebase easier to navigate for large teams.

Key Architectural Decisions:
- **Centralized API Layer**: All HTTP requests are managed in `src/Apis/` to decouple UI components from network logic.
- **Global Store**: Redux Toolkit is used for global session state (User Auth, Profile Data), while local component state handles UI interactions.
- **Custom Hooks**: Logic is extracted into hooks (e.g., `useDebounceHook`) for reusability.

## 6. Folder Structure

```
src/
├── Apis/                   # Centralized Axios instances and API service methods
├── AuthenticationComponents/ # Login, Register, OTP, and Password Reset forms
├── CustomHooks/            # Reusable hooks (e.g., debouncing, scroll handling)
├── HomeComponents/         # Dashboard widgets (Create Post, Feed, Sidebar)
├── LandingPage/            # Public-facing marketing pages (Hero, Features)
├── PostDetails/            # Detailed view of posts, comments, and interactions
├── ProfileSection/         # User profile management, settings, and stats
├── SideBarComponents/      # Secondary navigation (Friends, Suggestions, Invitations)
├── TripDetails/            # Core logic for Trip view (Expenses, Notes, Itinerary)
├── slices/                 # Redux Toolkit slices (User state, Store config)
├── App.jsx                 # Main application entry point and routing
└── main.jsx                # React DOM rendering
```

## 7. Authentication Flow

Authentication is handled via **JWT (JSON Web Tokens)**.

1.  **Login**: The user submits credentials. On success, the backend returns an Access Token (stored in memory/Redux) and sets a secure HttpOnly Refresh Token cookie.
2.  **Session Persistence**: On app load, a "Verify/Refresh" endpoint is called to check if a valid session exists.
3.  **Axios Interceptors**:
    - **Request Interceptor**: Attaches the Access Token to `Authorization` headers.
    - **Response Interceptor**: Detects `401 Unauthorized` errors. If a token expires, it automatically attempts to refresh the token using the HttpOnly cookie and retries the failed request seamlessly.

## 8. API Integration Strategy

We use **Axios** for all HTTP requests. The API layer is structured to support scalability:

- **Base Instance**: Configured in `src/Apis/axios.js` with base URLs and default headers.
- **Service Modules**: specific files for each domain (e.g., `tripApi.js`, `postApi.js`) containing async functions for each endpoint.
- **Error Handling**: Centralized error catching in the interceptors ensures consistent UI feedback (e.g., redirecting to login on session expiry).

## 9. State Management Approach

The application uses a hybrid state management strategy:

1.  **Redux Toolkit (`src/slices/`)**:
    - Used for **Global/Server State** that needs to be accessed across multiple features (e.g., Current User Profile, Authentication Status, Follower Lists).
    - Reduces "prop drilling" for deeply nested components.
2.  **Local State (`useState`, `useReducer`)**:
    - Used for UI-specific state (e.g., Modal visibility, Form inputs, Tab switching).
    - Keeps the global store clean and performant.

## 10. Environment Variables

Create a `.env` file in the root directory to configure the application:

```bash
# Backend API URL (Required)
VITE_API_URL=http://localhost:5000/api
```

## 11. How to Run Locally

**Prerequisites**: Node.js (v18+) and npm/yarn.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/travel-tales-frontend.git
    cd travel-tales-frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    - Rename `.env.example` to `.env` (if applicable) or create a new `.env` file.
    - Add your `VITE_API_URL`.

4.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The app will run at `http://localhost:5173`.

## 12. Challenges & Learnings

- **Complex Form Handling**: Implementing the "Create Trip" wizard with multiple steps (Dates -> Friends -> Settings) required careful state management to preserve data between steps without losing user progress.
- **Optimistic Updates**: Implementing instant feedback for "Likes" and "Follows" before the API responds improved the perceived speed of the app significantly.
- **Mobile Responsiveness**: Adapting the complex "Trip Planner" table for mobile screens required creative CSS Grid/Flexbox solutions and conditional rendering of non-essential columns.

## 13. Future Improvements

- **React Query Integration**: To replace some Redux boilerplate for server-state caching and automatic background refetching.
- **PWA Support**: Adding Service Workers to allow offline access to saved trips.
- **End-to-End Testing**: Implementing Cypress or Playwright tests for critical flows like "Create Trip" and "Signup".

## 14. Final Notes

This project represents a comprehensive effort to build a scalable, production-grade frontend architecture. It demonstrates proficiency in modern React patterns, component composition, and secure authentication handling.

Thank you for reviewing!
