"use client";

import { useState } from "react";
import Layout from "@/components/layout";
import Newsletters from "@/scenes/Newsletters";

export default function PagesPage() {
  const [current, setCurrent] = useState("newsletters");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Newsletters />
    </Layout>
  );
}
