import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";

const AUTH_SESSION_KEY = "helper_auth_session";

let authCheckPromise = null;

const getAuthStatus = async () => {
  if (localStorage.getItem(AUTH_SESSION_KEY) !== "1") {
    return false;
  }

  if (!authCheckPromise) {
    authCheckPromise = api
      .get("/auth/me")
      .then((res) => {
        const authenticated = Boolean(res.data?.authenticated);
        if (!authenticated) {
          localStorage.removeItem(AUTH_SESSION_KEY);
        }
        return authenticated;
      })
      .catch(() => {
        localStorage.removeItem(AUTH_SESSION_KEY);
        return false;
      })
      .finally(() => {
        authCheckPromise = null;
      });
  }

  return authCheckPromise;
};

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const authenticated = await getAuthStatus();

      if (!isMounted) return;

      setIsAuth(authenticated);
      setLoading(false);
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <Loader />;

  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
