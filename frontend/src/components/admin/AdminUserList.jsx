import React from "react";
import { useNavigate } from "react-router-dom";
import { formatYMD } from "../../util/formatYMD.jsx";
import "./style/AdminUserList.scss";

const AdminUserList = ({ items = [], onChangeLock, onChangeRole }) => {
  const navigate = useNavigate();

  return (
    <div className="admin-user-list-page">
      {/* 🔹 상단 네비 버튼 */}
      <div className="admin-top-actions">
        <button
          className="nav-btn active"
          onClick={() => navigate("/admin/users")}
        >
          사용자 관리
        </button>
        <button className="nav-btn" onClick={() => navigate("/admin/posts")}>
          게시글 관리
        </button>
        <button className="nav-btn" onClick={() => navigate("/admin/stats")}>
          통계 보기
        </button>
      </div>

      {/* 🔹 제목 */}
      <p className="page-desc">회원 계정, 권한, 상태를 관리합니다.</p>

      <div className="admin-user-list">
        <div className="list-header">
          <span>ID</span>
          <span>EMAIL</span>
          <span>NICKNAME</span>
          <span>ROLE</span>
          <span>STATUS</span>
          <span>DATE</span>
          <span>ACTION</span>
        </div>

        {items.length > 0 ? (
          <ul className="list-body">
            {items.map((it, i) => (
              <li key={it._id} className={it.isActive ? "" : "inactive"}>
                <span>{i + 1}</span>
                <span>{it.email}</span>
                <span>{it.displayName ?? "-"}</span>
                <span className={it.role === "admin" ? "role-admin" : ""}>
                  {it.role}
                </span>
                <span className={it.isActive ? "active" : "inactive"}>
                  {it.isActive ? "활성" : "비활성"}
                </span>
                <span>{it.createdAt ? formatYMD(it.createdAt) : ""}</span>

                <div className="btn-wrap">
                  <button
                    className={`btn role ${
                      it.role === "admin" ? "release" : "assign"
                    }`}
                    onClick={() => onChangeRole(it._id, it.role)}
                  >
                    {it.role === "admin" ? "관리자 해제" : "관리자 지정"}
                  </button>

                  <button
                    className={`btn status ${
                      it.isActive ? "disable" : "enable"
                    }`}
                    onClick={() => onChangeLock(it._id, it.isActive)}
                  >
                    {it.isActive ? "비활성화" : "활성화"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">사용자 데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default AdminUserList;
