"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Profile from "@/scenes/Profile";

export default function ProfilePage() {
  const [current, setCurrent] = useState("profile");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <Profile />
    </Layout>
  );
}
