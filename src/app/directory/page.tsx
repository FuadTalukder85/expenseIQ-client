"use client";

import React from "react";
import { UserDirectoryView } from "../../components/UserDirectoryView";
import { useAuth } from "../../context/AuthContext";

export default function DirectoryPage() {
  const { usersList, departments, currentUser, handleUserAdded, showToast } =
    useAuth();

  return (
    <UserDirectoryView
      users={usersList}
      departments={departments}
      currentUser={currentUser}
      onUserAdded={handleUserAdded}
      showToast={showToast}
    />
  );
}
