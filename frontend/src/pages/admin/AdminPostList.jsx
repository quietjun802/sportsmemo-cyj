import React from "react";
import "./style/AdminPostList.scss";

const AdminPostList = ({ items = [], onApprove, onReject, onDelete }) => {
  return (
    <ul className="admin-post-list">
      <li>
        <span>제목</span>
        <span>작성자</span>
        <span>상태</span>
        <span>날짜</span>
        <span>액션</span>
      </li>
      {items.map((it) => (
        <li key={it._id}>
          <span>{it.title}</span>
          <span>{it.user?.email || "익명"}</span>
          <span>{it.status}</span>
          <span>{new Date(it.createdAt).toLocaleDateString()}</span>
          <span className="btns">
            <button onClick={() => onApprove(it._id)}>승인</button>
            <button onClick={() => onReject(it._id)}>거절</button>
            <button onClick={() => onDelete(it._id)}>삭제</button>
          </span>
        </li>
      ))}
      {items.length === 0 && <li>게시글이 없습니다.</li>}
    </ul>
  );
};

export default AdminPostList;
