import React, { useState, useEffect } from "react";
import "./style/UploadForm.scss";

const UploadForm = ({ selectedPlayer }) => {
  const [player, setPlayer] = useState("");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (selectedPlayer) setPlayer(selectedPlayer);
  }, [selectedPlayer]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title || !description) {
      setMessage("⚠ 모든 항목을 입력해주세요!");
      return;
    }

    // ✅ 로컬스토리지에 저장된 JWT 토큰 불러오기
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("player", player);

    try {
      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 로그인 정보 전달
        },
      });

      if (res.ok) {
        setMessage("✅ 업로드 완료!");
        setFile(null);
        setTitle("");
        setDescription("");
      } else {
        const data = await res.json();
        setMessage(`❌ 업로드 실패: ${data.message || "알 수 없는 오류"}`);
      }
    } catch (err) {
      console.error("❌ 서버 오류:", err);
      setMessage("서버 오류가 발생했습니다.");
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="upload-row">
        {/* 파일 선택 */}
        <label className="upload-label">
          <span>파일 선택</span>
          <input type="file" onChange={handleFileChange} />
          <span className="file-name">{file ? file.name : "파일없음"}</span>
        </label>

        {/* 선수 이름 */}
        <input
          type="text"
          placeholder="선수 이름"
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          className="upload-input"
        />

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

      {/* 설명칸 (아래 한 줄 전체) */}
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
