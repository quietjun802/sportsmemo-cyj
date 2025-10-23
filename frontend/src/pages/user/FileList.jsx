import React, { useEffect, useState } from "react";
import "./style/FileList.scss";

const FileList = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "", player: "" });

  // ✅ 로그인 유저 정보 안전하게 불러오기
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // ✅ 게시글 불러오기
  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/files");
      if (!res.ok) throw new Error("게시글 조회 실패");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("❌ 파일 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ 게시글 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/files/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ 삭제 완료");
        fetchPosts();
      } else if (res.status === 401) {
        alert("⚠️ 로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert(`❌ 삭제 실패: ${data.message || "권한 없음 또는 서버 오류"}`);
      }
    } catch (err) {
      console.error("삭제 오류:", err);
      alert("❌ 서버 오류로 삭제 실패");
    }
  };

  // ✅ 수정 모드 전환
  const handleEdit = (post) => {
    setEditingPost(post._id);
    setEditData({
      title: post.title,
      description: post.description,
      player: post.player,
    });
  };

  // ✅ 수정 저장
  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/files/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ 수정 완료");
        setEditingPost(null);
        fetchPosts();
      } else if (res.status === 401) {
        alert("⚠️ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert(`❌ 수정 실패: ${data.message || "권한 없음 또는 서버 오류"}`);
      }
    } catch (err) {
      console.error("수정 오류:", err);
      alert("❌ 서버 오류로 수정 실패");
    }
  };

  return (
    <section className="file-list">
      {posts.length === 0 && <p className="filelist-msg">게시글이 없습니다 🥲</p>}

      {posts.map((post) => {
        const isMine = user && post.authorEmail && post.authorEmail === user.email; // ✅ 비교 확실히

        return (
          <div key={post._id} className="file-card">
            <img src={post.imageUrl} alt={post.title} className="file-image" />
            <div className="file-info">
              {editingPost === post._id ? (
                <>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="제목 수정"
                  />
                  <input
                    type="text"
                    value={editData.player}
                    onChange={(e) => setEditData({ ...editData, player: e.target.value })}
                    placeholder="선수 이름 수정"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="설명 수정"
                  />
                  <div className="file-actions">
                    <button onClick={() => handleUpdate(post._id)}>💾 저장</button>
                    <button onClick={() => setEditingPost(null)}>취소</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="file-title">{post.title}</h3>
                  <p className="file-player">⚽ {post.player}</p>
                  <p className="file-desc">{post.description}</p>
                  <p className="file-author">✍ {post.authorName}</p>

                  {isMine && (
                    <div className="file-actions">
                      <button onClick={() => handleEdit(post)}>✏ 수정</button>
                      <button onClick={() => handleDelete(post._id)}>🗑 삭제</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default FileList;
