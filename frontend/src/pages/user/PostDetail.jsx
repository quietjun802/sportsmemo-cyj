import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/client";
import "./style/PostDetail.scss";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);

  const fromDashboard = location.state?.fromDashboard;
  const fromSearch = location.state?.fromSearch;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/posts/${id}`);
        setPost(res.data);
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
      }
    })();
  }, [id]);

  if (!post) return <p>로딩 중...</p>;

  const handleBack = () => {
    // ✅ 검색에서 왔으면 검색한 선수 피드로 돌아가기
    if (fromSearch && post.player) {
      navigate("/search", { state: { selectedPlayer: post.player } });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="post-detail">
      <button className="back-btn" onClick={handleBack}>
        ← 돌아가기
      </button>

      <h2 className="post-title">{post.title || "제목 없음"}</h2>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title || "이미지"}
          className="post-image"
        />
      )}

      <p className="post-desc">{post.description || "내용이 없습니다."}</p>

      {/* ✅ 내 피드에서는 작성자 숨기고, 검색에서는 표시 */}
      {!fromDashboard && post.authorName && (
        <p className="post-author">작성자: {post.authorName}</p>
      )}
    </div>
  );
};

export default PostDetail;
