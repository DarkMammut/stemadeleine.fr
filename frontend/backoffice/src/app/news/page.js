"use client";

import { useState } from "react";
import Layout from "@/components/layout";
import News from "@/scenes/News";

export default function PagesPage() {
  const [current, setCurrent] = useState("news");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <News />
    </Layout>
  );
}
