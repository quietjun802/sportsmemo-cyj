import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import './style/PlayerSearch.scss'

const PlayerSearch = ({ onSelect }) => {
  const [players, setPlayers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);

  // CSV 불러오기
  useEffect(() => {
    fetch("/data/premier_league_players_ko.csv")
      .then((res) => res.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true });
        setPlayers(result.data);
      });
  }, []);

  // 검색 필터링
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
    setFiltered(result);
  }, [keyword, players]);

  // ✅ 선수 클릭 시 처리
  const handleSelect = (player) => {
    const fullName = player.player_name_ko || player.player_name;
    setKeyword(fullName);
    setSelected(fullName);
    setFiltered([]); // 리스트 닫기
    if (onSelect) onSelect(fullName);
  };

  return (
    <div className="player-search">
      <input
        type="text"
        className="player-input"
        placeholder="선수 이름(한글 또는 영어)"
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setSelected(null);
        }}
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
