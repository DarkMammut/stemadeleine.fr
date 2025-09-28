"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import EditPage from "@/scenes/EditPage";

export default function EditPagePage() {
  const { pageId } = useParams();
  const [current, setCurrent] = useState("website");

  if (!pageId) {
    return (
      <Layout current={current} setCurrent={setCurrent}>
        <p>Chargement...</p>
      </Layout>
    );
  }

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditPage pageId={pageId} />
    </Layout>
  );
}
