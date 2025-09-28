"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import EditPayment from "@/scenes/EditPayment";

export default function UsersPage() {
  const [current, setCurrent] = useState("payments");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditPayment />
    </Layout>
  );
}
