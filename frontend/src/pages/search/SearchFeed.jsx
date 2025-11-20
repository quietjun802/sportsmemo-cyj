// 🔥 수정본: 딱 필요한 부분만 수정

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Papa from "papaparse";
import "./SearchFeed.scss";

const API = import.meta.env.VITE_API_URL; // ⬅️ 추가

const SearchFeed = () => {
  const [keyword, setKeyword] = useState("");
  const [players, setPlayers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    if (!players.length) return;
    const initialKeyword = location.state?.initialKeyword || "";
    if (initialKeyword) {
      setKeyword(initialKeyword);
      setSelectedPlayer(initialKeyword);
    }
  }, [players, location.state]);

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

  const handleSelectPlayer = (p) => {
    const full = p.player_name_ko || p.player_name;
    setKeyword(full);
    setSelectedPlayer(full);
    setFiltered([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelectPlayer(filtered[0]);
    }
  };

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

  // 🔥 수정된 부분: localhost 삭제 → API URL로 변경 + credentials 포함
  useEffect(() => {
    if (!selectedPlayer) return;

    fetch(
      `${API}/api/posts/player/${encodeURIComponent(selectedPlayer)}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("❌ 게시글 불러오기 실패:", err));
  }, [selectedPlayer]);

  const handleNavigate = (id) => {
    navigate(`/user/post/${id}`, {
      state: { fromSearch: true, selectedPlayer },
    });
  };

  return (
    <section className="search-feed">
      <div className="content">
        <header className="search-header">
          <h1>선수별 포토메모 피드</h1>
          <p>
            한글 또는 영어 이름으로 검색하면 해당 선수를 태그한 모든 유저의 글이 표시됩니다.
          </p>
          <button
            className="back-btn"
            onClick={() =>
              navigate("/user", { state: { selectedPlayer } })
            }
          >
            ← 내 피드로 돌아가기
          </button>
        </header>

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
                  <div
                    key={post._id}
                    className="feed-card"
                    onClick={() => handleNavigate(post._id)}
                  >
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
          <p className="search-placeholder">
            검색할 선수를 입력해보세요 ⚽️
          </p>
        )}
      </div>
    </section>
  );
};

export default SearchFeed;
