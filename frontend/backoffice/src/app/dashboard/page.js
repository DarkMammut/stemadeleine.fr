"use client";
import { useState } from "react";
import Layout from "@/components/layout";
import Dashboard from "@/scenes/Dashboard";

export default function DashboardPage() {
  const [current, setCurrent] = useState("dashboard");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Dashboard />
    </Layout>
  );
}
