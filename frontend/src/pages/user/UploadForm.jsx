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

    try {
      // 🔹 formData 구성
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("player", player);

      // 🔹 백엔드로 업로드 요청 (S3 + MongoDB)
      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("업로드 실패");

      const data = await res.json();
      console.log("✅ 업로드 성공:", data);

      setMessage("✅ 업로드 완료!");
      setFile(null);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("❌ 업로드 오류:", err);
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

      {/* 설명칸 */}
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
