"use client";

import { motion } from 'framer-motion';

/**
 * SceneLayout - Layout réutilisable pour toutes les scènes
 *
 * @param {React.ReactNode} children - Contenu de la scène
 * @param {string} className - Classes CSS supplémentaires (optionnel)
 */
export default function SceneLayout({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-6xl mx-auto p-6 space-y-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
