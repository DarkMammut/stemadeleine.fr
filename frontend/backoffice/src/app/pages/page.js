"use client";
import { useState } from "react";
import Layout from "@/components/layout";
import useGetPages from "@/Queries/useGetPages";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [current, setCurrent] = useState("pages");
  const { pages, loading, error } = useGetPages();

  const handleEdit = (id) => {};

  if (loading) return <p>Chargement…</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <h2 className="text-2xl font-semibold mb-4">Pages</h2>
        <div className="grid grid-cols-4 gap-4">
          <ul>
            <li className="p-2 text-left">Title</li>
            <li className="p-2 text-left">Sub Title</li>
            <li className="p-2 text-left">Creation Date</li>
            <li className="sr-only p-2 text-left">Edit Button</li>
          </ul>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <ul>
            {pages.map((page) => (
              <div key={page.id}>
                <li className="p-4 bg-white rounded-2xl shadow">
                  {page.title}
                </li>
                <li className="p-4 bg-white rounded-2xl shadow">
                  {page.subTitle}
                </li>
                <li className="p-4 bg-white rounded-2xl shadow">
                  {page.createdAt}
                </li>
                <li>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    onClick={() => handleEdit(page.id)}
                  >
                    Éditer
                  </button>
                </li>
              </div>
            ))}
          </ul>
        </div>
      </motion.div>
    </Layout>
  );
}
