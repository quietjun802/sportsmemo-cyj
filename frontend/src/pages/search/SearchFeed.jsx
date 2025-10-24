import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./SearchFeed.scss";

const SearchFeed = () => {
  const [keyword, setKeyword] = useState("");
  const [players, setPlayers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [posts, setPosts] = useState([]);

  // ✅ CSV 불러오기
  useEffect(() => {
    fetch("/data/premier_league_players_ko.csv")
      .then((res) => res.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true });
        setPlayers(result.data);
      });
  }, []);

  // ✅ 자동완성
  useEffect(() => {
    if (!keyword.trim()) {
      setFiltered([]);
      return;
    }
    const result = players.filter(
      (p) =>
        p.player_name_ko?.includes(keyword) ||
        p.player_name?.toLowerCase().includes(keyword.toLowerCase())
    );
    setFiltered(result.slice(0, 8));
  }, [keyword]);

  // ✅ 선택 시
  const handleSelectPlayer = (playerObj) => {
    const name = playerObj.player_name_ko || playerObj.player_name;
    setSelectedPlayer(name);
    setKeyword(name);
    setFiltered([]);
  };

  // ✅ 선수별 글 불러오기
  useEffect(() => {
    if (!selectedPlayer) return;
    fetch(`http://localhost:3000/api/posts/player/${encodeURIComponent(selectedPlayer)}`)
      .then((res) => res.json())
      .then(setPosts)
      .catch((err) => console.error("❌ 선수별 포스트 로드 실패:", err));
  }, [selectedPlayer]);

  return (
    <section className="search-feed container">
      <header className="search-header">
        <h1>선수별 포토메모 피드</h1>
        <p>한글 또는 영어 이름으로 검색하면 해당 선수를 태그한 모든 유저의 글이 표시됩니다.</p>
      </header>

      {/* ✅ 검색창 */}
      <div className="player-search">
        <input
          type="text"
          placeholder="선수 이름 (자동완성)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        {filtered.length > 0 && (
          <ul className="player-list">
            {filtered.map((p, idx) => (
              <li key={idx} onClick={() => handleSelectPlayer(p)}>
                {p.player_name_ko || p.player_name} — {p.team}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ 결과 */}
      {selectedPlayer && (
        <>
          <h2 className="search-result-title">📸 {selectedPlayer} 관련 포토메모</h2>
          <div className="feed-list">
            {posts.length === 0 ? (
              <p className="empty">등록된 포스트가 없습니다.</p>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="feed-card">
                  <img src={post.imageUrl} alt={post.title} />
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <small>작성자: {post.authorName}</small>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default SearchFeed;
