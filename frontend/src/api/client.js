import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// ✅ 기본 설정: 백엔드 쿠키 기반 인증
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ✅ 쿠키 항상 포함
});

// ✅ Authorization 헤더 제거 — 쿠키 인증만 사용
api.interceptors.request.use(
  (config) => {
    // ❌ localStorage에 있는 토큰을 헤더로 추가하지 않음
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 에러 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const code = err?.response?.status;

    // 토큰 만료나 권한 없음일 때
    if (code === 401 || code === 403) {
      localStorage.removeItem("user"); // ✅ 쿠키는 서버가 관리하니까 유저 정보만 지워주면 됨
    }

    return Promise.reject(err);
  }
);

// ✅ 에러 메시지 헬퍼
export function getErrorMessage(error, fallback = "요청 실패") {
  return error.response?.data?.message || error.message || fallback;
}

// ✅ 회원가입
export async function register({ email, password, displayname }) {
  const { data } = await api.post("/api/auth/register", {
    email,
    password,
    displayname,
  });
  return data;
}

// ✅ 로그인 (쿠키 자동 저장됨)
export async function login({ email, password }) {
  const { data } = await api.post("/api/auth/login", {
    email,
    password,
  });
  return data;
}

// ✅ 로그인 유저 정보 가져오기
export async function fetchMe() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

// ✅ 로그아웃
export async function logout() {
  return await api.post("/api/auth/logout");
}

// ✅ 로컬 스토리지 관리 (user만 저장)
export function saveAuthToStorage({ user }) {
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuthStorage() {
  localStorage.removeItem("user");
}

export default api;
