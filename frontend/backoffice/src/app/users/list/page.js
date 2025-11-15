"use client";

import { useState } from "react";
import Layout from "@/components/ui/Layout";
import ListUser from "@/scenes/ListUser";

export default function UsersPage() {
  const [current, setCurrent] = useState("users");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <ListUser />
    </Layout>
  );
}
