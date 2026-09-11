import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import AppLayout from "./layouts/AppLayout.jsx";
import Profile from "./features/auth/pages/Profile.jsx"; // adjust path to match your structure

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },

    {
        path: "/register",
        element: <Register />
    },

    {
  path: "/profile",
  element: <Profile />,
},

    {
        element: <AppLayout />,
        children: [
            {
                path: "/",
                element: (
                    <Protected>
                        <Home />
                    </Protected>
                )
            },

            {
                path: "/interview/:interviewId",
                element: (
                    <Protected>
                        <Interview />
                    </Protected>
                )
            }
        ]
    }
]);