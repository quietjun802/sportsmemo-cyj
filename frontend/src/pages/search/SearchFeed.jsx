import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import "./SearchFeed.scss";

const SearchFeed = () => {
  const [keyword, setKeyword] = useState("");
  const [players, setPlayers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  // ✅ 유저 정보 불러오기 (상단 표시용)
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ✅ CSV 불러오기
  useEffect(() => {
    fetch("/data/premier_league_players_ko.csv")
      .then((res) => res.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true });
        const clean = result.data.filter(
          (p) => p.player_name || p.player_name_ko
        );
        setPlayers(clean);
      })
      .catch((err) => console.error("CSV 불러오기 실패:", err));
  }, []);

  // ✅ 자동완성 필터링
  useEffect(() => {
    if (!keyword.trim()) {
      setFiltered([]);
      return;
    }

    const lower = keyword.toLowerCase();
    const result = players.filter((p) => {
      const ko = p.player_name_ko?.toLowerCase() || "";
      const en = p.player_name?.toLowerCase() || "";
      return ko.includes(lower) || en.includes(lower);
    });
    setFiltered(result.slice(0, 8));
  }, [keyword, players]);

  // ✅ 선수 선택
  const handleSelectPlayer = (p) => {
    const full = p.player_name_ko || p.player_name;
    setKeyword(full);
    setSelectedPlayer(full);
    setFiltered([]);
  };

  // ✅ Enter로 자동완성 선택
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelectPlayer(filtered[0]);
    }
  };

  // ✅ Blur 시 자동보정
  const handleBlur = () => {
    const lower = keyword.toLowerCase().trim();
    if (!lower) return;

    const match = players.find((p) => {
      const ko = p.player_name_ko?.toLowerCase() || "";
      const en = p.player_name?.toLowerCase() || "";
      return ko.includes(lower) || en.includes(lower);
    });

    if (match) {
      const full = match.player_name_ko || match.player_name;
      setKeyword(full);
      setSelectedPlayer(full);
    }

    setTimeout(() => setFiltered([]), 100);
  };

  // ✅ 선택된 선수 게시글 로드
  useEffect(() => {
    if (!selectedPlayer) return;

    fetch(
      `http://localhost:3000/api/posts/player/${encodeURIComponent(
        selectedPlayer
      )}`
    )
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("❌ 게시글 불러오기 실패:", err));
  }, [selectedPlayer]);

  // ✅ 로그아웃
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <section className="search-feed">
      {/* ✅ 상단 네비게이션 */}
      <div className="top-bar">
        <div className="logo">
          <span className="logo-icon">⚽️</span>
          <span className="logo-text">Photomemo</span>
          {user && <span className="user-name">{user.displayname}</span>}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      {/* ✅ 메인 콘텐츠 중앙정렬 */}
      <div className="content">
        <header className="search-header">
          <h1>선수별 포토메모 피드</h1>
          <p>
            한글 또는 영어 이름으로 검색하면 해당 선수를 태그한 모든 유저의 글이
            표시됩니다.
          </p>

          <button className="back-btn" onClick={() => navigate("/user")}>
            ← 내 피드로 돌아가기
          </button>
        </header>

        {/* ✅ 검색창 */}
        <div className="player-search">
          <input
            type="text"
            placeholder="선수 이름 (자동완성)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="search-input"
            autoComplete="off"
          />
          {filtered.length > 0 && (
            <ul className="player-list">
              {filtered.map((p, idx) => (
                <li key={idx} onClick={() => handleSelectPlayer(p)}>
                  <span className="player-name">
                    {p.player_name_ko || p.player_name}
                  </span>
                  <span className="player-team"> — {p.team}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ✅ 검색 결과 */}
        {selectedPlayer ? (
          <>
            <h2 className="search-result-title">
              📸 {selectedPlayer} 관련 포토메모
            </h2>
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
        ) : (
          <p className="search-placeholder">검색할 선수를 입력해보세요 ⚽️</p>
        )}
      </div>
    </section>
  );
};

export default SearchFeed;
