import React from "react";
import { useNavigate } from "react-router-dom";
import UploadForm from "./UploadForm";
import FileList from "./FileList";
import api from "../../api/client.js"; // ✅ 경로 수정
import "./style/UserDashboard.scss";

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>내 포토메모</h1>
        <button className="search-btn" onClick={() => navigate("/search")}>
          🔍 선수 검색
        </button>
      </div>

      {/* 업로드 섹션 */}
      <section className="dashboard-section upload-section">
        <UploadForm />
      </section>

      {/* ✅ 내 피드 */}
      <section className="dashboard-section feed-section">
        <FileList showAllUsers={false} endpoint="/api/posts/my" />
      </section>
    </div>
  );
};

export default UserDashboard;
