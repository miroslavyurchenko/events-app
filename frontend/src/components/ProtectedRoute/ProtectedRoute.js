import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // если не залогинен
  if (!user) {
    return <Navigate to="/" />;
  }

  // если роль не совпадает
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  // доступ разрешён
  return children;
};

export default ProtectedRoute;