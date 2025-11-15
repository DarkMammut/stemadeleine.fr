"use client";

import { useState } from "react";
import Layout from "@/components/ui/Layout";
import Settings from "@/scenes/Settings";

export default function UsersPage() {
  const [current, setCurrent] = useState("settings");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Settings />
    </Layout>
  );
}
