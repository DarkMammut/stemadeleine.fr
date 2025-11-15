"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/ui/Layout";
import EditModule from "@/scenes/EditModule";

export default function EditModulePage() {
  const { pageId, sectionId, moduleId } = useParams();
  const [current, setCurrent] = useState("website");

  if (!moduleId) {
    return (
      <Layout current={current} setCurrent={setCurrent}>
        <p>Chargement...</p>
      </Layout>
    );
  }

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditModule pageId={pageId} sectionId={sectionId} moduleId={moduleId} />
    </Layout>
  );
}
