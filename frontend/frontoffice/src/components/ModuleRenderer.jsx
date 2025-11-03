import React from "react";
import PropTypes from "prop-types";
import ArticleModule from "./modules/ArticleModule";
import NewsModule from "./modules/NewsModule";
import GalleryModule from "./modules/GalleryModule";

const ModuleRenderer = ({ module }) => {
  if (!module) {
    return null;
  }

  const { type } = module;

  switch (type) {
    case "ARTICLE":
      return <ArticleModule module={module} />;
    case "NEWS":
      return <NewsModule module={module} />;
    case "GALLERY":
      return <GalleryModule module={module} />;
    case "NEWSLETTER":
      // return <NewsletterModule module={module} />;
      return <div>Newsletter module not implemented yet</div>;
    case "FORM":
      // return <FormModule module={module} />;
      return <div>Form module not implemented yet</div>;
    case "CTA":
      // return <CTAModule module={module} />;
      return <div>CTA module not implemented yet</div>;
    case "TIMELINE":
      // return <TimelineModule module={module} />;
      return <div>Timeline module not implemented yet</div>;
    case "LIST":
      // return <ListModule module={module} />;
      return <div>List module not implemented yet</div>;
    default:
      console.warn(`Unknown module type: ${type}`);
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Module de type "{type}" non pris en charge
          </p>
        </div>
      );
  }
};

ModuleRenderer.propTypes = {
  module: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    name: PropTypes.string,
    isVisible: PropTypes.bool,
    sortOrder: PropTypes.number,
  }).isRequired,
};

export default ModuleRenderer;
