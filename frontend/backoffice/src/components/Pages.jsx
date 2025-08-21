import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function Pages() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/pages")
      .then((res) => setData(res.data))
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, []);

  const pages = useMemo(() => data, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Pages</h2>
      <table className="w-full bg-white rounded-2xl shadow">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Titre</th>
            <th className="p-2 text-left">Slug</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{p.title}</td>
              <td className="p-2">{p.slug}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
