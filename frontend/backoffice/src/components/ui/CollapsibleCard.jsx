import React from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function CollapsibleCard({
  isOpen,
  onToggle,
  leading = null,
  renderTitle = null,
  title = null,
  meta = null,
  actions = null,
  children,
  className = "",
}) {
  return (
    <div className={`collapsible-card ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Réduire" : "Déployer"}
            type="button"
          >
            {isOpen ? (
              <ChevronDownIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* optional leading control (eg. Switch) */}
          {leading && <div className="flex-shrink-0">{leading}</div>}

          <div className="flex-1 min-w-0">
            {renderTitle ? (
              renderTitle()
            ) : (
              <div className="flex items-center gap-2">
                {title && (
                  <div className="font-semibold text-gray-900 truncate">
                    {title}
                  </div>
                )}
                {meta && <div className="text-xs text-gray-500">{meta}</div>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">{actions}</div>
        </div>

        {/* body with collapse animation */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden border-t border-gray-200"
            >
              <div className="p-6">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

CollapsibleCard.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  leading: PropTypes.node,
  renderTitle: PropTypes.func,
  title: PropTypes.node,
  meta: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};

CollapsibleCard.defaultProps = {
  leading: null,
  renderTitle: null,
  title: null,
  meta: null,
  actions: null,
  children: null,
  className: "",
};
