"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Site from "@/scenes/Site";

export default function UsersPage() {
  const [current, setCurrent] = useState("settings");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Site />
    </Layout>
  );
}
