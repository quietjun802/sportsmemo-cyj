import "./App.scss";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthPanel from "./components/AuthPanel";
import Landing from "./pages/Landing";
import Header from "./components/Header";
import ProtectRoute from "./components/ProtectRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import SearchFeed from "./pages/search/SearchFeed"; // ✅ 검색 페이지 추가

import {
  fetchMe as apifetchMe,
  logout as apilogout,
  saveAuthToStorage,
  clearAuthStorage,
} from "./api/client";

function App() {
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [me, setMe] = useState(null);
  const isAuthed = !!token;

  // ✅ 헤더 표시 조건
  const hideOn = new Set(["/", "/admin/login"]);
  const showHeader = isAuthed && !hideOn.has(location.pathname);

  // ✅ 로그인 후 처리
  const HandleAuthed = async ({ user, token }) => {
    try {
      setUser(user);
      setToken(token ?? null);
      saveAuthToStorage({ user, token });
      handleFetchMe();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ 로그아웃
  const handleLogout = async () => {
    try {
      await apilogout();
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      setToken(null);
      setMe(null);
      clearAuthStorage();
    }
  };

  // ✅ 내 정보 조회
  const handleFetchMe = async () => {
    try {
      const { user } = await apifetchMe();
      setMe(user);
    } catch (error) {
      setMe({ error: "내정보 조회 실패" });
      console.error(error);
    }
  };

  useEffect(() => {
    if (isAuthed) handleFetchMe();
  }, [isAuthed]);

  return (
    <div className="page">
      {/* ✅ 로그인된 상태에서만 헤더 표시 */}
      {showHeader && (
        <Header isAuthed={isAuthed} user={user} onLogout={handleLogout} />
      )}

      <Routes>
        {/* ✅ 비로그인 사용자 */}
        <Route path="/" element={<Landing />} />

        {/* ✅ 관리자 로그인 */}
        <Route
          path="/admin/login"
          element={
            <AuthPanel
              isAuthed={isAuthed}
              user={user}
              me={me}
              onFetchMe={handleFetchMe}
              onLogout={handleLogout}
              onAuthed={HandleAuthed}
              requiredRole="admin"
            />
          }
        />

        {/* ✅ 사용자 보호 구역 */}
        <Route
          path="/user"
          element={
            <ProtectRoute
              user={user}
              isAuthed={isAuthed}
              redirect="/admin/login"
            />
          }
        >
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
        </Route>

        {/* ✅ 검색 페이지 (ProtectRoute 제거 / 로그인 조건부 렌더링) */}
        <Route
          path="/search"
          element={
            isAuthed ? <SearchFeed /> : <Navigate to="/" replace />
          }
        />

        {/* ✅ 관리자 보호 구역 */}
        <Route
          path="/admin"
          element={
            <ProtectRoute
              isAuthed={isAuthed}
              user={user}
              requiredRole="admin"
            />
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ✅ 기본 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
