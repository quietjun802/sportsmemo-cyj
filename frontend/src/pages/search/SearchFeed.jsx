import React, { useState } from "react";
import PlayerSearch from "../../components/PlayerSearch";
import FileList from "../user/FileList";
import "./SearchFeed.scss"; // ✅ SCSS 추가

const SearchFeed = () => {
  const [selectedPlayer, setSelectedPlayer] = useState("");

  return (
    <section className="search-feed container">
      <header className="search-header">
        <h1>선수별 포토메모 피드</h1>
        <p>한글 또는 영어 이름으로 검색하면 해당 선수를 태그한 모든 유저의 글이 표시됩니다.</p>
      </header>

      <div className="search-box">
        <PlayerSearch onSelect={(name) => setSelectedPlayer(name)} />
      </div>

      {selectedPlayer ? (
        <>
          <h2 className="search-result-title">
            📸 <strong>{selectedPlayer}</strong> 관련 포토메모
          </h2>
          <FileList selectedPlayer={selectedPlayer} showAllUsers={true} />
        </>
      ) : (
        <p className="search-placeholder">검색할 선수를 입력해보세요 ⚽</p>
      )}
    </section>
  );
};

export default SearchFeed;
