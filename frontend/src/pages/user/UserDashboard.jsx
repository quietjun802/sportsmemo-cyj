import React, { useState } from "react";
import FileList from "./FileList";
import UploadForm from "./UploadForm";
import PlayerSearch from "../../components/PlayerSearch";

const UserDashboard = () => {
  const [selectedPlayer, setSelectedPlayer] = useState("");

  return (
    <section style={{ padding: "30px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h2>프리미어리그 선수 검색</h2>
        <PlayerSearch onSelect={(name) => setSelectedPlayer(name)} />
      </div>

      <UploadForm selectedPlayer={selectedPlayer} />
      <FileList />
    </section>
  );
};

export default UserDashboard;
