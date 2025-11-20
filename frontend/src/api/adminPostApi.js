import axios from "axios";

const API = axios.create({
  baseURL: "import.meta.env.VITE_API_URL",
  withCredentials: true,
});

// ✅ 게시글 전체 조회
export const fetchAdminPosts = async () => {
  const res = await API.get("/posts");
  return res.data;
};

// ✅ 게시글 상태 변경 (승인/거절)
export const patchAdminPost = async (id, data) => {
  const res = await API.patch(`/posts/${id}/status`, data);
  return res.data;
};

// ✅ 게시글 삭제
export const deleteAdminPost = async (id) => {
  const res = await API.delete(`/posts/${id}`);
  return res.data;
};
