import HomePage from "@/pages/HomePage";
import Navbar from "@/components/Navbar/Navbar.tsx";
import Footer from "@/components/ui/Footer";
import LoginForm from "@/form/LoginForm";
import "@/globals.css";
import { AuthProvider } from "@/hooks/AuthContext";
import client from "@/lib/apolloClient";
import CommentPage from "@/pages/CommentPage";
import HashtagPage from "@/pages/HashtagPage";
import HashtagsPage from "@/pages/HashtagsPage";
import NotFound from "@/pages/NotFound";
import PostPage from "@/pages/PostPage.tsx";
import Profile from "@/pages/Profile";
import SearchPage from "@/pages/Search.tsx";
import UsersPage from "@/pages/UsersPage";
import { ApolloProvider } from "@apollo/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

//Yeeter

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginForm view="login" />,
  },
  {
    path: "/register",
    element: <LoginForm view="register" />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/user",
    element: <Profile />,
  },

  {
    path: "/user/:username",
    element: <Profile />,
  },
  {
    path: "/user/:username/:view",
    element: <Profile />,
  },
  {
    path: "/search/",
    element: <SearchPage />,
  },
  {
    path: "/post/:id/:edit?",
    element: <PostPage />,
  },
  {
    path: "/reply/:id/:edit?",
    element: <CommentPage />,
  },
  {
    path: "/hashtag/",
    element: <HashtagsPage />,
  },
  {
    path: "/hashtag/:hashtag",
    element: <HashtagPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <Toaster />
        <div className="flex min-h-svh flex-col bg-gray-100 dark:bg-gray-800">
          <Navbar />
          <div className="mb-4 flex flex-grow items-start">
            <RouterProvider router={router} />
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
);
