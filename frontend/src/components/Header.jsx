import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Papa from "papaparse";
import "./style/Header.scss";

const Header = ({ isAuthed, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState("");
  const [players, setPlayers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1); // 🔹 키보드 네비게이션용

  // ✅ CSV 불러오기
  useEffect(() => {
    fetch("/data/premier_league_players_ko.csv")
      .then((res) => res.text())
      .then((text) => {
        const cleanText = text.replace(/^\uFEFF/, ""); // BOM 제거
        const result = Papa.parse(cleanText, { header: true });
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
      setSelectedIndex(-1);
      return;
    }

    const lower = keyword.toLowerCase();
    const result = players.filter((p) => {
      const ko = p.player_name_ko?.toLowerCase() || "";
      const en = p.player_name?.toLowerCase() || "";
      return ko.includes(lower) || en.includes(lower);
    });

    setFiltered(result.slice(0, 8));
    setSelectedIndex(-1);
  }, [keyword, players]);

  // ✅ 로그아웃
  const handleLogout = async () => {
    if (!window.confirm("정말 로그아웃 하시겠어요?")) return;
    try {
      await onLogout();
    } catch {}
  };

  // ✅ 자동완성 선택 시 이동
  const handleSelectPlayer = (p) => {
    const full = p.player_name_ko || p.player_name;
    setKeyword(full);
    setFiltered([]);
    navigate("/search", { state: { initialKeyword: full } });
  };

  // ✅ 키보드 입력 처리
  const handleKeyDown = (e) => {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSelectPlayer(filtered[selectedIndex]);
      } else {
        navigate("/search", { state: { initialKeyword: keyword.trim() } });
      }
    }
  };

  // ✅ 검색 버튼으로 이동
  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate("/search", { state: { initialKeyword: keyword.trim() } });
    setFiltered([]);
  };

  // ✅ 특정 페이지에서는 헤더 숨김
  const hideOn = new Set(["/admin/login", "/"]);
  if (hideOn.has(location.pathname)) return null;

  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="left">
          <h1 className="logo" onClick={() => navigate("/user/dashboard")}>
            ⚽️ Photomemo
          </h1>
        </div>

        <div className="auth-area">
          {isAuthed && (
            <>
              <span className="welcome">
                {user?.displayName || user?.email || "user"}
              </span>
              <button className="btn logout" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>

      {/* ✅ 중앙 검색바 */}
      {isAuthed && (
        <div className="search-bar">
          <form className="search-inner" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="선수 이름을 검색하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button type="submit">🔍 검색</button>
          </form>

          {/* ✅ 자동완성 리스트 */}
          {filtered.length > 0 && (
            <ul className="player-autocomplete">
              {filtered.map((p, idx) => (
                <li
                  key={idx}
                  onMouseDown={() => handleSelectPlayer(p)}
                  className={selectedIndex === idx ? "active" : ""}
                >
                  <span className="player-name">
                    {p.player_name_ko || p.player_name}
                  </span>
                  <span className="player-team"> — {p.team}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
