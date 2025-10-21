import React, { useEffect, useState } from "react";
import "./style/FileList.scss"; // ✅ SCSS 연결

const FileList = ({ selectedPlayer, showAllUsers = false }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch("/api/files") // ✅ 실제 백엔드 API 경로에 맞게 수정 필요
      .then((res) => res.json())
      .then((data) => {
        let result = data;

        // ✅ 특정 선수 검색 필터
        if (selectedPlayer) {
          result = result.filter((f) =>
            f.description?.includes(selectedPlayer)
          );
        }

        // ✅ showAllUsers = false → 로그인한 사용자 글만 보기
        if (!showAllUsers) {
          const rawUser = localStorage.getItem("user");
          if (rawUser) {
            const { email } = JSON.parse(rawUser);
            result = result.filter((f) => f.user_email === email);
          }
        }

        setFiles(result);
      })
      .catch((err) => console.error("파일 불러오기 실패:", err));
  }, [selectedPlayer, showAllUsers]);

  return (
    <div className="file-list">
      {files.length > 0 ? (
        <ul className="file-items">
          {files.map((file) => (
            <li key={file.id} className="file-item">
              <div className="file-thumb">
                <img src={file.image_url} alt={file.title} />
              </div>
              <div className="file-info">
                <h3 className="file-title">{file.title}</h3>
                <p className="file-desc">{file.description}</p>
                <p className="file-meta">
                  {file.user_name && (
                    <span className="file-author">작성자: {file.user_name}</span>
                  )}
                  <span className="file-date">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="file-empty">표시할 글이 없습니다 😢</p>
      )}
    </div>
  );
};

export default FileList;
