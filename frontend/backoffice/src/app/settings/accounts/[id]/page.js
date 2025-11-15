"use client";

import { useState } from "react";
import Layout from "@/components/ui/Layout";
import EditAccount from "@/scenes/EditAccount";

export default function UsersPage() {
  const [current, setCurrent] = useState("settings");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditAccount />
    </Layout>
  );
}
