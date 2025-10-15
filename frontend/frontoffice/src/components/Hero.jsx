import React from "react";
import PropTypes from "prop-types";
import useGetMedia from "../hooks/useGetMedia";

export default function Hero({ mediaId, title }) {
  const { mediaUrl } = useGetMedia(mediaId);

  return (
    <section
      className="relative h-60 bg-center bg-cover overflow-hidden shadow-lg"
      style={{
        backgroundImage: `url(${mediaUrl})`,
      }}
    >
      {/* Overlay foncé léger */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Titre en bas de la bannière */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        {title && (
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white text-center uppercase drop-shadow-lg">
            {title}
          </h1>
        )}
      </div>
    </section>
  );
}

Hero.propTypes = {
  mediaId: PropTypes.string,
  title: PropTypes.string.isRequired,
};
