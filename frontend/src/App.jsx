import "./App.scss";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthPanel from "./components/AuthPanel";
import Landing from "./pages/Landing";
import Header from "./components/Header";
import ProtectRoute from "./components/ProtectRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPosts from "./pages/admin/AdminPosts";
import UserDashboard from "./pages/user/UserDashboard";
import SearchFeed from "./pages/search/SearchFeed";
import PostDetail from "./pages/user/PostDetail"; // ✅ 상세 페이지 import 추가

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

  // ✅ 로그인 상태 확인
  const isAuthed = !!(token || user);

  const hideOn = new Set(["/", "/admin/login"]);
  const showHeader = isAuthed && !hideOn.has(location.pathname);

  // ✅ 로그인 처리
  const HandleAuthed = async ({ user, token }) => {
    try {
      setUser(user);
      setToken(token ?? null);
      saveAuthToStorage({ user, token });
      handleFetchMe();
    } catch (error) {
      console.error("로그인 처리 오류:", error);
    }
  };

  // ✅ 로그아웃
  const handleLogout = async () => {
    try {
      await apilogout();
    } catch (error) {
      console.error("로그아웃 오류:", error);
    } finally {
      setUser(null);
      setToken(null);
      setMe(null);
      clearAuthStorage();
    }
  };

  // ✅ 내정보 조회
  const handleFetchMe = async () => {
    try {
      const { user } = await apifetchMe();
      setMe(user);
    } catch (error) {
      console.error("내정보 조회 실패:", error);
      setMe({ error: "내정보 조회 실패" });
    }
  };

  useEffect(() => {
    if (isAuthed) handleFetchMe();
  }, [isAuthed]);

  return (
    <div className="page">
      {showHeader && (
        <Header isAuthed={isAuthed} user={user} onLogout={handleLogout} />
      )}

      <Routes>
        {/* ✅ 비로그인 홈 */}
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

          {/* ✅ 게시글 상세 페이지 추가 */}
          <Route path="post/:id" element={<PostDetail />} />
        </Route>

        {/* ✅ 검색 페이지 */}
        <Route
          path="/search"
          element={isAuthed ? <SearchFeed /> : <Navigate to="/" replace />}
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
          <Route path="users" element={<AdminUsers />} />
          <Route path="posts" element={<AdminPosts />} />
        </Route>

        {/* ✅ 기본 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
