import React from "react";
import PropTypes from "prop-types";

const GalleryModule = ({ module }) => {
  if (!module.isVisible) {
    return null;
  }

  return (
    <div className="w-full py-6 border-b border-gray-200 last:border-b-0">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          🖼️ {module.title || "Gallery Module"}
        </h3>
        <p className="text-green-600 text-sm">
          Module Gallery - Implémentation à venir
        </p>
      </div>
    </div>
  );
};

GalleryModule.propTypes = {
  module: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    isVisible: PropTypes.bool,
  }).isRequired,
};

export default GalleryModule;
