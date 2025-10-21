import React from "react";
import FileList from "./FileList";
import UploadForm from "./UploadForm";
import PlayerSearch from "../../components/PlayerSearch"; // ✅ 추가

const UserDashboard = () => {
  return (
    <section style={{ padding: "30px" }}>
      {/* ⚽ 프리미어리그 선수 검색 */}
      <div style={{ marginBottom: "50px" }}>
        <h2 style={{ marginBottom: "15px" }}>프리미어리그 선수 검색</h2>
        <PlayerSearch />
      </div>

      {/* 📸 포토메모 업로드 */}
      <UploadForm />

      {/* 📂 업로드한 파일 목록 */}
      <FileList />
    </section>
  );
};

export default UserDashboard;
