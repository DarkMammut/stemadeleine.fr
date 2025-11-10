"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import Modules from "@/scenes/Modules";

export default function ModulesPage() {
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
      <Modules sectionId={sectionId} pageId={pageId} />
    </Layout>
  );
}
