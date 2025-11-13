"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Accounts from "@/scenes/Accounts";

export default function UsersPage() {
  const [current, setCurrent] = useState("settings");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Accounts />
    </Layout>
  );
}
