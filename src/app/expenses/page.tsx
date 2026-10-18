"use client";

import React from "react";
import { ExpensesView } from "../../components/ExpensesView";
import { useAuth } from "../../context/AuthContext";

export default function ExpensesPage() {
  const { currentUser, showToast } = useAuth();

  return <ExpensesView currentUser={currentUser} showToast={showToast} />;
}
