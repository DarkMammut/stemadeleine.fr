"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/ui/Layout";
import EditNews from "@/scenes/EditNews";

export default function NewsPage() {
  const [current, setCurrent] = useState("news");
  const params = useParams();
  const newsId = params.newsId;

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditNews newsId={newsId} />
    </Layout>
  );
}
