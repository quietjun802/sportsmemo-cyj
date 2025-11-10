import React, { useEffect, useState, useCallback } from "react";
import { fetchAdminPosts, patchAdminPost, deleteAdminPost } from "../../api/adminPostApi";
import AdminPostList from "../../components/admin/AdminPostList";

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);

  const getPosts = useCallback(async () => {
    try {
      const data = await fetchAdminPosts();
      setPosts(data);
    } catch (err) {
      console.error("❌ 게시글 불러오기 실패:", err);
    }
  }, []);

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  const handleApprove = async (id) => {
    const updated = await patchAdminPost(id, { status: "approved" });
    setPosts((prev) => prev.map((p) => (p._id === id ? updated : p)));
  };

  const handleReject = async (id) => {
    const updated = await patchAdminPost(id, { status: "rejected" });
    setPosts((prev) => prev.map((p) => (p._id === id ? updated : p)));
  };

  const handleDelete = async (id) => {
    await deleteAdminPost(id);
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="admin-posts">
      <h2>게시글 관리</h2>
      <AdminPostList
        items={posts}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminPosts;
