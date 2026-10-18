"use client";

import React from "react";
import { OverviewView } from "../components/OverviewView";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { currentUser, setCurrentUser, showToast } = useAuth();

  return (
    <OverviewView
      currentUser={currentUser}
      onUserRefreshed={(u) => setCurrentUser(u)}
      showToast={showToast}
    />
  );
}
