import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectRoute = ({
  isAuthed,
  user,
  requiredRole,
  redirect, // 기본값 제거
}) => {
  const location = useLocation();

  // ✅ 로그인 안 돼 있을 때
  if (!isAuthed) {
    // admin 페이지면 admin/login 으로
    if (requiredRole === "admin") {
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }
    // 그 외 페이지(예: /user, /search)는 일반 메인으로
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // ✅ 권한 체크 (관리자 전용 구간에서 user 접근 방지)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // ✅ 정상 접근
  return <Outlet />;
};

export default ProtectRoute;
