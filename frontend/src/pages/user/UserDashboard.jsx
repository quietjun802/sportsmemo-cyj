import React, { useState } from "react";
import FileList from "./FileList";
import UploadForm from "./UploadForm";
import PlayerSearch from "../../components/PlayerSearch";
import "./style/UserDashboard.scss";

const UserDashboard = () => {
  const [selectedPlayer, setSelectedPlayer] = useState("");

  return (
    <main className="dashboard-container">
      {/* 1️⃣ 선수 검색 */}
      <section className="dashboard-section search-section">
        <h2>⚽ 프리미어리그 선수 검색</h2>
        <PlayerSearch onSelect={(name) => setSelectedPlayer(name)} />
      </section>

      {/* 2️⃣ 업로드 폼 */}
      <section className="dashboard-section upload-section">
        <UploadForm selectedPlayer={selectedPlayer} />
      </section>

      {/* 3️⃣ 게시글 피드 */}
      <section className="dashboard-section feed-section">
        <FileList selectedPlayer={selectedPlayer} />
      </section>
    </main>
  );
};

export default UserDashboard;
