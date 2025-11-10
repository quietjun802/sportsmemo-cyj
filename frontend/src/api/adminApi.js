import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/admin", // 백엔드 주소
  withCredentials: true,
});

// ✅ 사용자 전체 조회
export const fetchAdminUsers = async () => {
  const res = await API.get("/users");
  return res.data;
};

// ✅ 관리자 지정 / 해제
export const patchUserRole = async (id, role) => {
  const res = await API.patch(`/users/${id}/role`, { role });
  return res.data;
};

// ✅ 계정 활성화 / 비활성화
export const patchUserStatus = async (id, isActive) => {
  const res = await API.patch(`/users/${id}/status`, { isActive });
  return res.data;
};
