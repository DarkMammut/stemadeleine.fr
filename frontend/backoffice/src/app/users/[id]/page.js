"use client";

import { useState } from "react";
import Layout from "@/components/layout";
import EditUser from "@/scenes/EditUser";

export default function UsersPage() {
  const [current, setCurrent] = useState("users");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditUser />
    </Layout>
  );
}
