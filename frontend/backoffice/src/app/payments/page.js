"use client";

import { useState } from "react";
import Layout from "@/components/ui/Layout";
import Payments from "@/scenes/Payments";

export default function UsersPage() {
  const [current, setCurrent] = useState("payments");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Payments />
    </Layout>
  );
}
