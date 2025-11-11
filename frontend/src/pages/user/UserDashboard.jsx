import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadForm from "./UploadForm";
import FileList from "./FileList";
import api from "../../api/client.js";
import "./style/UserDashboard.scss";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false); // ✅ 업로드 폼 토글 상태

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>내 포토메모</h1>

        {/* 선수 검색은 헤더로 옮겼기 때문에 이건 제거 */}
        {/* <button className="search-btn" onClick={() => navigate("/search")}>
          🔍 선수 검색
        </button> */}

        {/* ✏️ 글쓰기 버튼 */}
        <button
          className="write-btn"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "작성 닫기 ✖" : "✏️ 글쓰기"}
        </button>
      </div>

      {/* 업로드 폼: 글쓰기 버튼 눌렀을 때만 보이게 */}
      {showForm && (
        <section className="dashboard-section upload-section">
          <UploadForm />
        </section>
      )}

      {/* 내 피드 */}
      <section className="dashboard-section feed-section">
        <FileList showAllUsers={false} endpoint="/api/posts/my" />
      </section>
    </div>
  );
};

export default UserDashboard;
