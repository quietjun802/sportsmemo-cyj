import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/AdminDashboard.scss";

const AdminDashboard = () => {
  const navigate = useNavigate();

    const cards = [
    {
      title: "사용자 관리",
      desc: "회원 계정 및 권한 관리",
      action: () => navigate("/admin/users"),
    },
    {
      title: "게시글 관리",
      desc: "사용자 게시글 승인 / 거절 / 삭제",
      action: () => navigate("/admin/posts"), // ✅ 여기 연결
    },
  ];
  
  return (
    <div className="admin-dashboard">
      <h1>관리자 대시보드</h1>
      <p>관리자 기능을 선택하세요.</p>

      <div className="admin-menu-row">
        <div className="menu-card" onClick={() => navigate("/admin/users")}>
          <h2>사용자 관리</h2>
          <p>회원 계정, 권한, 상태 관리</p>
        </div>

        <div className="menu-card" onClick={() => navigate("/admin/posts")}>
          <h2>게시글 관리</h2>
          <p>등록된 포토메모 게시글 관리</p>
        </div>

        <div className="menu-card" onClick={() => navigate("/admin/stats")}>
          <h2>통계 보기</h2>
          <p>이용자 수와 게시글 통계 확인</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
