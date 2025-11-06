"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Contacts from "@/scenes/Contacts";

export default function ContactsPage() {
  const [current, setCurrent] = useState("contacts");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Contacts />
    </Layout>
  );
}
