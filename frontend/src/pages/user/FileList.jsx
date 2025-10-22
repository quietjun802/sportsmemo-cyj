import React, { useEffect, useState } from "react";
import "./style/FileList.scss";

const FileList = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "", player: "" });
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ 게시글 불러오기
  const fetchPosts = async () => {
    const res = await fetch("http://localhost:3000/api/files");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ 게시글 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`http://localhost:3000/api/files/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("✅ 삭제 완료");
      fetchPosts();
    } else {
      alert("❌ 삭제 실패");
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

  // ✅ 수정 완료
  const handleUpdate = async (id) => {
    const res = await fetch(`http://localhost:3000/api/files/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      alert("✅ 수정 완료");
      setEditingPost(null);
      fetchPosts();
    } else {
      alert("❌ 수정 실패");
    }
  };

  return (
    <section className="file-list">
      {posts.map((post) => {
        const isMine = user && post.authorEmail === user.email;

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
                  />
                  <input
                    type="text"
                    value={editData.player}
                    onChange={(e) => setEditData({ ...editData, player: e.target.value })}
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                  <button onClick={() => handleUpdate(post._id)}>💾 저장</button>
                  <button onClick={() => setEditingPost(null)}>취소</button>
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
