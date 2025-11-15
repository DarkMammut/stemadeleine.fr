"use client";

import { useState } from "react";
import Layout from "@/components/ui/Layout";
import Pages from "@/scenes/Pages";

export default function PagesPage() {
  const [current, setCurrent] = useState("website");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Pages />
    </Layout>
  );
}
