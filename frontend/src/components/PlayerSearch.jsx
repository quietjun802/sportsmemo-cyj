import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./style/PlayerSearch.scss";

const PlayerSearch = ({ value, onChange, onSelect, placeholder }) => {
  const [players, setPlayers] = useState([]);
  const [keyword, setKeyword] = useState(value || "");
  const [filtered, setFiltered] = useState([]);

  // ✅ CSV 파일 불러오기
  useEffect(() => {
    fetch("/data/premier_league_players_ko.csv")
      .then((res) => res.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true });
        setPlayers(result.data);
      })
      .catch((err) => console.error("CSV 불러오기 실패:", err));
  }, []);

  // ✅ 검색 필터링
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
    setFiltered(result.slice(0, 8)); // 최대 8개까지만 표시
  }, [keyword, players]);

  // ✅ 선수 선택 시 처리
  const handleSelect = (player) => {
    const fullName = player.player_name_ko || player.player_name;
    setKeyword(fullName);
    setFiltered([]); // 리스트 닫기
    if (onSelect) onSelect(fullName);
    if (onChange) onChange(fullName);
  };

  // ✅ 입력 변경 핸들러
  const handleInputChange = (e) => {
    const val = e.target.value;
    setKeyword(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="player-search">
      <input
        type="text"
        className="player-input"
        placeholder={placeholder || "선수 이름 (한글 또는 영어)"}
        value={keyword}
        onChange={handleInputChange}
        autoComplete="off"
      />

      {filtered.length > 0 && (
        <ul className="player-list">
          {filtered.map((player, idx) => (
            <li
              key={idx}
              className="player-item"
              onClick={() => handleSelect(player)}
            >
              <span className="player-name">
                {player.player_name_ko || player.player_name}
              </span>
              <span className="player-team"> — {player.team}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerSearch;
