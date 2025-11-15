import React from 'react';
import PropTypes from 'prop-types';

// Réutiliser les composants existants pour garder la même structure HTML
import Panel from '@/components/ui/Panel';
import CardList from '@/components/ui/CardList';
import CardSkeleton from '@/components/ui/CardSkeleton';

/**
 * LoadingSkeleton
 * Variantes disponibles: 'card', 'list', 'panel', 'tree'
 * Utiliser pour afficher des placeholders pendant les chargements de page
 */
export default function LoadingSkeleton({
  variant = "card",
  count = 3,
  size = "md",
  className = "",
  showActions = false,
}) {
  const base = "skeleton";

  const sizes = {
    sm: {
      card: { hImg: "h-24", hLine: "h-3", mb: "mb-2" },
      list: { hRow: "h-8", gap: "gap-2" },
      panel: { h: "h-20" },
      tree: { hNode: "h-8" },
    },
    md: {
      card: { hImg: "h-36", hLine: "h-3.5", mb: "mb-3" },
      list: { hRow: "h-10", gap: "gap-3" },
      panel: { h: "h-28" },
      tree: { hNode: "h-10" },
    },
    lg: {
      card: { hImg: "h-48", hLine: "h-4", mb: "mb-4" },
      list: { hRow: "h-12", gap: "gap-4" },
      panel: { h: "h-40" },
      tree: { hNode: "h-12" },
    },
  };

  const s = sizes[size] || sizes.md;

  // Variantes
  if (variant === "card") {
    // Utiliser CardList pour conserver la même structure que les cartes réelles
    return (
      <CardList>
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} showActions={showActions} />
        ))}
      </CardList>
    );
  }

  if (variant === "list") {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className={`flex-1 ${base} rounded ${s.list.hRow}`} />
            <div className={`${base} w-24 ${s.list.hRow} rounded`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "panel") {
    // Utiliser Panel pour conserver la même structure HTML (header + content)
    return (
      <div className={className}>
        <Panel>
          <div className={`p-0`}>
            <div className={`${base} w-1/3 ${s.panel.h} rounded`} />
            <div className="mt-4 space-y-3">
              <div className={`${base} w-full h-3 rounded`} />
              <div className={`${base} w-5/6 h-3 rounded`} />
              <div className={`${base} w-2/3 h-3 rounded`} />
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  if (variant === "tree") {
    return (
      <div className={`${className} space-y-2`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="pl-0">
            <div className={`flex items-center gap-3 ${s.tree.hNode}`}>
              <div className={`${base} w-6 h-6 rounded-full`} />
              <div className={`${base} w-1/3 ${s.tree.hNode} rounded`} />
            </div>
            <div className="pl-8 mt-2 space-y-2">
              <div className={`${base} w-1/2 ${s.tree.hNode} rounded`} />
              <div className={`${base} w-1/4 ${s.tree.hNode} rounded`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // fallback simple
  return (
    <div className={`${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${base} w-full h-6 rounded my-2`} />
      ))}
    </div>
  );
}

LoadingSkeleton.propTypes = {
  variant: PropTypes.oneOf(["card", "list", "panel", "tree"]),
  count: PropTypes.number,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  showActions: PropTypes.bool,
};
