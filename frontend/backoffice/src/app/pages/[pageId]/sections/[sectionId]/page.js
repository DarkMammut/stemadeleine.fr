"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/ui/Layout";
import EditSection from "@/scenes/EditSection";

export default function EditSectionPage() {
  const { sectionId, pageId } = useParams();
  const [current, setCurrent] = useState("website");

  if (!sectionId || !pageId) {
    return (
      <Layout current={current} setCurrent={setCurrent}>
        <p>Chargement...</p>
      </Layout>
    );
  }

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditSection sectionId={sectionId} pageId={pageId} />
    </Layout>
  );
}
