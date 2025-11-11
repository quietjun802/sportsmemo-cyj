import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/FileList.scss";

const FileList = ({ endpoint = "/api/posts/my" }) => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    player: "",
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ✅ 게시글 불러오기
  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("게시글 조회 실패");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("❌ 파일 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [endpoint]);

  // ✅ 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/files/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        alert("✅ 삭제 완료");
        fetchPosts();
      } else {
        const data = await res.json();
        alert(`❌ 삭제 실패: ${data.message || "권한 없음 또는 서버 오류"}`);
      }
    } catch (err) {
      console.error("삭제 오류:", err);
      alert("❌ 서버 오류로 삭제 실패");
    }
  };

  // ✅ 수정 모드 진입
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        alert("✅ 수정 완료");
        setEditingPost(null);
        fetchPosts();
      } else {
        const data = await res.json();
        alert(`❌ 수정 실패: ${data.message || "권한 없음 또는 서버 오류"}`);
      }
    } catch (err) {
      console.error("수정 오류:", err);
      alert("❌ 서버 오류로 수정 실패");
    }
  };

  // ✅ 상세 페이지 이동 (대시보드에서 들어왔다는 정보 같이 전달)
  const handleNavigate = (id) => {
    navigate(`/user/post/${id}`, { state: { fromDashboard: true } }); // ✅ 수정된 부분
  };

  return (
    <section className="file-list">
      {posts.length === 0 && <p className="filelist-msg">게시글이 없습니다 🥲</p>}

      {posts.map((post) => {
        const isMine = user && post.authorEmail === user.email;
        const isEditing = editingPost === post._id;

        return (
          <div
            key={post._id}
            className={`file-card ${isEditing ? "editing" : ""}`}
          >
            {/* ✅ 클릭 시 상세 페이지 이동 */}
            {!isEditing && (
              <div
                className="file-click-area"
                onClick={() => handleNavigate(post._id)}
              >
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="file-image"
                />
              </div>
            )}

            <div className="file-info">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    placeholder="제목 수정"
                  />
                  <input
                    type="text"
                    value={editData.player}
                    onChange={(e) =>
                      setEditData({ ...editData, player: e.target.value })
                    }
                    placeholder="선수 이름 수정"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    placeholder="설명 수정"
                  />
                  <div className="file-actions">
                    <button onClick={() => handleUpdate(post._id)}>💾 저장</button>
                    <button onClick={() => setEditingPost(null)}>취소</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="file-player">⚽ {post.player}</p>
                  <h3 className="file-title">{post.title}</h3>
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
