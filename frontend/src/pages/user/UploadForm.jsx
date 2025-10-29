import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./style/UploadForm.scss";

const UploadForm = ({ selectedPlayer }) => {
  const [player, setPlayer] = useState("");
  const [players, setPlayers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

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

  // ✅ 외부 선택 반영
  useEffect(() => {
    if (selectedPlayer) setPlayer(selectedPlayer);
  }, [selectedPlayer]);

  // ✅ 자동완성 필터링
  useEffect(() => {
    if (!player.trim() || players.length === 0) {
      setFiltered([]);
      return;
    }

    const keyword = player.toLowerCase();
    const result = players.filter((p) => {
      const ko = p.player_name_ko?.toLowerCase() || "";
      const en = p.player_name?.toLowerCase() || "";
      return ko.includes(keyword) || en.includes(keyword);
    });

    setFiltered(result.slice(0, 8));
  }, [player, players]);

  // ✅ 클릭 및 자동선택 처리
  const handleSelectPlayer = (p) => {
    const full = p.player_name_ko || p.player_name;
    setPlayer(full);
    setFiltered([]);
  };

  // ✅ Enter 누르면 첫 번째 항목 자동 선택
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelectPlayer(filtered[0]);
    }
  };

  // ✅ Blur 시 자동 보정 (filtered 여부 상관없이 CSV 전체 탐색)
  const handleBlur = () => {
    const keyword = player.toLowerCase().trim();
    if (!keyword) return;

    // 전체 CSV에서 일치 항목 검색
    const match = players.find((p) => {
      const ko = p.player_name_ko?.toLowerCase() || "";
      const en = p.player_name?.toLowerCase() || "";
      return ko.includes(keyword) || en.includes(keyword);
    });

    if (match) {
      const full = match.player_name_ko || match.player_name;
      setPlayer(full);
    }

    // 살짝 딜레이 후 리스트 닫기
    setTimeout(() => setFiltered([]), 100);
  };

  // ✅ 업로드 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title || !description || !player) {
      setMessage("⚠ 모든 항목을 입력해주세요!");
      return;
    }

    // 🔍 정확히 일치하는 선수만 허용
    const matched = players.find(
      (p) =>
        p.player_name_ko === player ||
        p.player_name === player
    );

    if (!matched) {
      setMessage("⚠ 존재하지 않는 선수입니다. 자동완성 또는 엔터로 확정해주세요!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("player", matched.player_name_ko || matched.player_name);

      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // ✅ 쿠키 전송 (가장 중요)
      });


      if (!res.ok) throw new Error("업로드 실패");
      const data = await res.json();
      console.log("✅ 업로드 성공:", data);

      setMessage("✅ 업로드 완료!");
      setFile(null);
      setTitle("");
      setDescription("");
      setPlayer("");
      setFiltered([]);
    } catch (err) {
      console.error("❌ 업로드 오류:", err);
      setMessage(
        err.message.includes("401")
          ? "로그인이 필요합니다."
          : "서버 오류가 발생했습니다."
      );
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="upload-row">
        {/* 파일 선택 */}
        <label className="upload-label">
          <span>파일 선택</span>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <span className="file-name">{file ? file.name : "파일없음"}</span>
        </label>

        {/* ✅ 자동완성 입력 */}
        <div className="player-search">
          <input
            type="text"
            placeholder="선수 이름 (자동완성)"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            onKeyDown={handleKeyDown}     // ✅ 엔터 자동확정
            onBlur={handleBlur}           // ✅ 블러 자동보정 (CSV 전역 검색)
            className="upload-input"
            autoComplete="off"
          />
          {filtered.length > 0 && (
            <ul className="player-list">
              {filtered.map((p, idx) => (
                <li
                  key={idx}
                  className="player-item"
                  onClick={() => handleSelectPlayer(p)}
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

        {/* 제목 */}
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="upload-input"
        />

        {/* 업로드 버튼 */}
        <button type="submit" className="upload-btn">
          업로드
        </button>
      </div>

      {/* 설명 */}
      <div className="upload-description">
        <textarea
          placeholder="설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {message && <p className="upload-msg">{message}</p>}
    </form>
  );
};

export default UploadForm;
