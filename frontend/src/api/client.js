import axios from "axios";

// ✅ API 기본 URL (환경 변수 없을 시 fallback)
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "import.meta.env.VITE_API_URL";

// ✅ Axios 인스턴스 (쿠키 인증 기반)
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ✅ 쿠키 자동 포함
  timeout: 10000,
});

// ✅ 요청 인터셉터 — 필요시 토큰 주입 가능 (기본은 쿠키 인증만)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // 필요하면 특정 요청만 토큰 추가 가능 (예: 관리자 전용)
    if (config.headers["use-token"] && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터 — 인증 만료 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const code = err?.response?.status;

    if (code === 401 || code === 403) {
      console.warn("⛔ 인증 만료: 사용자 정보 초기화됨");
      localStorage.removeItem("user");
    }

    return Promise.reject(err);
  }
);

// ✅ 공통 에러 메시지 헬퍼
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

// ✅ 로그인 (쿠키 자동 저장)
export async function login({ email, password }) {
  const { data } = await api.post("/api/auth/login", { email, password });
  if (data?.user) saveAuthToStorage(data);
  return data;
}

// ✅ 로그인 유저 정보
export async function fetchMe() {
  try {
    const { data } = await api.get("/api/auth/me");
    return data;
  } catch (err) {
    console.warn("⚠️ 세션 만료됨");
    clearAuthStorage();
    throw err;
  }
}

// ✅ 로그아웃
export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } finally {
    clearAuthStorage();
  }
}

// ✅ 로컬 스토리지 관리
export function saveAuthToStorage({ user, token }) {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  if (token) localStorage.setItem("token", token);
}

export function clearAuthStorage() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export default api;
