"use client";

import { useState } from "react";
import Layout from "@/components/ui/Layout";
import Users from "@/scenes/Users";

export default function UsersPage() {
  const [current, setCurrent] = useState("users");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Users />
    </Layout>
  );
}
