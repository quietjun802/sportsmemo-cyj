import React from "react";
import { formatYMD } from "../../util/formatYMD.jsx";
import "./style/AdminUserList.scss";

const AdminUserList = ({ items = [], onChangeLock, onChangeRole }) => {
  return (
    <ul className="admin-list">
      <li>
        <span>ID</span>
        <span>EMAIL</span>
        <span>NICKNAME</span>
        <span>ROLE</span>
        <span>STATUS</span>
        <span>DATE</span>
        <span>ACTION</span>
      </li>

      {items.map((it, i) => (
        <li key={it._id}>
          <span>{i + 1}</span>
          <span>{it.email}</span>
          <span>{it.displayName ?? "-"}</span>
          <span>{it.role}</span>
          <span>{it.isActive ? "활성" : "비활성"}</span>
          <span>{it.createdAt ? formatYMD(it.createdAt) : ""}</span>

          <div className="btn-wrap">
            <button
              className="btn role"
              onClick={() => onChangeRole(it._id, it.role)}
            >
              {it.role === "admin" ? "관리자 해제" : "관리자 지정"}
            </button>

            <button
              className="btn status"
              onClick={() => onChangeLock(it._id, it.isActive)}
            >
              {it.isActive ? "비활성화" : "활성화"}
            </button>
          </div>
        </li>
      ))}

      {items.length === 0 && (
        <li className="empty">사용자 데이터가 없습니다.</li>
      )}
    </ul>
  );
};

export default AdminUserList;
