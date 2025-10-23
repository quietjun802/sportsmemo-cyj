import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./style/UploadForm.scss";

const UploadForm = ({ selectedPlayer }) => {
  const [player, setPlayer] = useState("");
  const [validPlayer, setValidPlayer] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [players, setPlayers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const token = localStorage.getItem("token");

  // ✅ CSV 불러오기 (빈 줄 제거)
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
      setValidPlayer(false);
      return;
    }

    const result = players.filter((p) => {
      const ko = p.player_name_ko || "";
      const en = p.player_name || "";
      return (
        ko.includes(player) ||
        en.toLowerCase().includes(player.toLowerCase())
      );
    });

    setFiltered(result.slice(0, 8));

    const match = players.some((p) => {
      const ko = p.player_name_ko || "";
      const en = p.player_name || "";
      return (
        ko === player ||
        en.toLowerCase() === player.toLowerCase()
      );
    });

    setValidPlayer(match);
  }, [player]);

  // ✅ 선수 선택 시 (onMouseDown으로 변경)
  const handleSelectPlayer = (playerObj) => {
    const fullName = playerObj.player_name_ko || playerObj.player_name;
    setPlayer(fullName);
    setValidPlayer(true);
    setFiltered([]); // 리스트 닫기
  };

  // ✅ 업로드 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title || !description || !player) {
      setMessage("⚠ 모든 항목을 입력해주세요!");
      return;
    }

    if (!validPlayer) {
      setMessage("⚠ 존재하지 않는 선수입니다. 자동완성에서 선택해주세요!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("player", player);

      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("업로드 실패");
      const data = await res.json();

      console.log("✅ 업로드 성공:", data);
      setMessage("✅ 업로드 완료!");
      setFile(null);
      setTitle("");
      setDescription("");
      setPlayer("");
      setValidPlayer(false);
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

        {/* ✅ 선수 자동완성 입력 */}
        <div className="player-search">
          <input
            type="text"
            className={`upload-input ${validPlayer ? "valid" : "invalid"}`}
            placeholder="선수 이름 (자동완성)"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            autoComplete="off"
            onBlur={() => setTimeout(() => setFiltered([]), 100)} // ✅ 블러시 살짝 딜레이 후 닫기
          />

          {filtered.length > 0 && (
            <ul className="player-list">
              {filtered.map((p, idx) => (
                <li
                  key={idx}
                  className="player-item"
                  onMouseDown={() => handleSelectPlayer(p)} // ✅ onClick → onMouseDown으로 변경
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
          disabled={!validPlayer}
        />

        {/* 업로드 버튼 */}
        <button type="submit" className="upload-btn" disabled={!validPlayer}>
          업로드
        </button>
      </div>

      {/* 설명칸 */}
      <div className="upload-description">
        <textarea
          placeholder="설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!validPlayer}
        />
      </div>

      {message && <p className="upload-msg">{message}</p>}
    </form>
  );
};

export default UploadForm;
