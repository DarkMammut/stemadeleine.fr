"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/ui/Layout";
import EditNewsletters from "@/scenes/EditNewsletters";

export default function NewsletterPage() {
  const [current, setCurrent] = useState("newsletters");
  const params = useParams();
  const newsletterId = params.newsletterId;

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditNewsletters newsletterId={newsletterId} />
    </Layout>
  );
}
