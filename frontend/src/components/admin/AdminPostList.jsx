import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/AdminPostList.scss";

const AdminPostList = ({ items = [], onApprove, onReject, onDelete }) => {
  const navigate = useNavigate();

  if (!items.length)
    return (
      <div className="admin-post-page">
        <div className="admin-top-nav">
          <button onClick={() => navigate("/admin/users")}>사용자 관리</button>
          <button className="active" onClick={() => navigate("/admin/posts")}>
            게시글 관리
          </button>
          <button onClick={() => navigate("/admin/stats")}>통계 보기</button>
        </div>

        <p className="admin-desc">등록된 포토메모 게시글이 없습니다.</p>
        <div className="admin-empty">등록된 게시글이 없습니다.</div>
      </div>
    );

  return (
    <div className="admin-post-page">
      {/* 🔹 관리자 네비게이션 */}
      <div className="admin-top-nav">
        <button onClick={() => navigate("/admin/users")}>사용자 관리</button>
        <button className="active" onClick={() => navigate("/admin/posts")}>
          게시글 관리
        </button>
        <button onClick={() => navigate("/admin/stats")}>통계 보기</button>
      </div>

      <p className="admin-desc">등록된 포토메모 게시글을 관리합니다.</p>

      <div className="admin-post-list">
        <div className="list-header">
          <span>작성자</span>
          <span>제목</span>
          <span>상태</span>
          <span>작성일</span>
          <span>관리</span>
        </div>

        <ul className="list-body">
          {items.map((post) => (
            <li key={post._id} className={`list-row ${post.status}`}>
              <span className="author">{post.authorEmail}</span>
              <span className="title">{post.title}</span>

              <span
                className={`status ${
                  post.status === "approved"
                    ? "approved"
                    : post.status === "rejected"
                    ? "rejected"
                    : "pending"
                }`}
              >
                {post.status === "approved"
                  ? "승인됨"
                  : post.status === "rejected"
                  ? "거절됨"
                  : "대기중"}
              </span>

              <span className="date">
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </span>

              <div className="actions">
                {post.status !== "approved" && (
                  <button
                    className="btn approve"
                    onClick={() => onApprove(post._id)}
                  >
                    승인
                  </button>
                )}
                {post.status !== "rejected" && (
                  <button
                    className="btn reject"
                    onClick={() => onReject(post._id)}
                  >
                    거절
                  </button>
                )}
                <button
                  className="btn delete"
                  onClick={() => onDelete(post._id)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPostList;
