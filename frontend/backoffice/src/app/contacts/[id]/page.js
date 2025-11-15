"use client";

import { useState } from "react";
import Layout from "@/components/ui/Layout";
import EditContact from "@/scenes/EditContact";

export default function ContactDetailPage() {
  const [current, setCurrent] = useState("contacts");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditContact />
    </Layout>
  );
}
