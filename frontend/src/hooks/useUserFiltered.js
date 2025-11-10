import { useMemo } from "react";

/**
 * 사용자 리스트 필터링 훅
 * @param {Array} items - 사용자 목록 (API로 불러온 원본 배열)
 * @param {Object} filter - 필터 상태 { q, user, status }
 * @param {Object} keyMap - 검색 기준 { q: "email", user: "_id", status: "status" }
 */
const useUserFiltered = (items, filter, keyMap) => {
  return useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items.filter((it) => {
      const q = filter.q?.trim().toLowerCase() || "";
      const user = filter.user?.trim().toLowerCase() || "";
      const status = filter.status || "";

      // 이메일 검색
      const matchQ = keyMap.q
        ? it[keyMap.q]?.toLowerCase().includes(q)
        : true;

      // 사용자 ID 검색
      const matchUser = keyMap.user
        ? it[keyMap.user]?.toLowerCase().includes(user)
        : true;

      // 상태 필터 (활성/비활성)
      const matchStatus = status
        ? it[keyMap.status] === status
        : true;

      return matchQ && matchUser && matchStatus;
    });
  }, [items, filter, keyMap]);
};

export default useUserFiltered;
