"use client";
import { useState } from "react";
import Layout from "@/components/layout";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [current, setCurrent] = useState("dashboard");

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl shadow">Pages: 12</div>
          <div className="p-4 bg-white rounded-2xl shadow">Actualités: 4</div>
          <div className="p-4 bg-white rounded-2xl shadow">Contacts: 8</div>
        </div>
      </motion.div>
    </Layout>
  );
}
