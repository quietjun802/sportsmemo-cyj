import React, { useEffect, useState, useCallback } from "react";
import {
  fetchAdminUsers,
  patchUserRole,
  patchUserStatus,
} from "../../api/adminApi";
import AdminUserList from "../../components/admin/AdminUserList";
import AdminUserFilter from "../../components/admin/AdminUserFilter";
import useUserFiltered from "../../hooks/useUserFiltered";
import "./style/AdminUsers.scss";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({
    q: "",
    user: "",
    status: "",
  });

  const getUsers = useCallback(async () => {
    try {
      const res = await fetchAdminUsers();
      setUsers(res);
    } catch (err) {
      console.error("❌ 사용자 목록 불러오기 실패:", err);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await patchUserRole(
        id,
        role === "admin" ? "user" : "admin"
      );
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
    } catch (err) {
      console.error("❌ 권한 변경 실패:", err);
    }
  };

  const handleStatusChange = async (id, isActive) => {
    try {
      const updated = await patchUserStatus(id, !isActive);
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
    } catch (err) {
      console.error("❌ 상태 변경 실패:", err);
    }
  };

  // ✅ 필터링된 리스트
  const filteredUsers = useUserFiltered(users, filter, {
    q: "email",
    user: "_id",
    status: "status",
  });

  return (
    <div className="admin-users">
      <h1>사용자 관리</h1>
      <p>회원 계정, 권한, 상태를 관리합니다.</p>

      <AdminUserFilter filterValue={filter} onFilterChange={setFilter} />
      <AdminUserList
        items={filteredUsers}
        onChangeRole={handleRoleChange}
        onChangeLock={handleStatusChange}
      />
    </div>
  );
};

export default AdminUsers;
