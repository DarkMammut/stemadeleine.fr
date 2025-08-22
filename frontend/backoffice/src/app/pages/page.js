"use client";

import { useState } from "react";
import Layout from "@/components/layout";
import Pages from "@/app/scenes/Pages";

export default function PagesPage() {
  const [current, setCurrent] = useState("pages");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Pages />
    </Layout>
  );
}
