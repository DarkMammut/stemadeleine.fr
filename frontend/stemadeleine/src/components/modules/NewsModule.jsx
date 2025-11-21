import React from "react";
import PropTypes from "prop-types";

const NewsModule = ({ module }) => {
  if (!module.isVisible) {
    return null;
  }

  return (
    <div className="w-full py-6 border-b border-gray-200 last:border-b-0">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          📰 {module.title || "News Module"}
        </h3>
        <p className="text-blue-600 text-sm">
          Module News - Implémentation à venir
        </p>
        {module.variant && (
          <p className="text-xs text-blue-500 mt-1">
            Variante: {module.variant}
          </p>
        )}
      </div>
    </div>
  );
};

NewsModule.propTypes = {
  module: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    isVisible: PropTypes.bool,
    variant: PropTypes.string,
  }).isRequired,
};

export default NewsModule;
