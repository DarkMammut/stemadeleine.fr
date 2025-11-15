"use client";

import { useState } from "react";
import Layout from "@/components/ui/Layout";
import Organization from "@/scenes/Organization";

export default function UsersPage() {
  const [current, setCurrent] = useState("settings");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Organization />
    </Layout>
  );
}
