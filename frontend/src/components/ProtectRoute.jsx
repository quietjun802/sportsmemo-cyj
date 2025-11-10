import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectRoute = ({ isAuthed, user, requiredRole }) => {
  const location = useLocation();
  const authed = !!(isAuthed || user);

  console.log("🧩 [ProtectRoute check]", {
    path: location.pathname,
    authed,
    role: user?.role,
    requiredRole,
  });

  if (!authed) {
    console.warn("🚫 인증 안됨 → redirect");
    if (requiredRole === "admin") {
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.warn("🚫 권한 부족 → redirect");
    return <Navigate to="/" replace />;
  }

  console.log("✅ 접근 허용 →", location.pathname);
  return <Outlet />;
};

export default ProtectRoute;
