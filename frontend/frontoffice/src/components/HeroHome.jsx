import React from "react";
import PropTypes from "prop-types";
import useGetMedia from "../hooks/useGetMedia";

export default function HeroHome({ mediaId, title, subtitle }) {
  const { mediaUrl } = useGetMedia(mediaId);

  return (
    <section
      className="relative h-[80vh] bg-fixed bg-center bg-cover rounded-b-[50%] overflow-hidden shadow-lg"
      style={{
        backgroundImage: `url(${mediaUrl})`,
      }}
    >
      {/* Overlay foncé léger */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Encadrement flouté */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-primary/30 backdrop-blur-md rounded-lg px-10 py-8 text-center text-gray-900 shadow-xl max-w-2xl">
          {title && (
            <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4">
              {title}
            </h1>
          )}
          <hr className="border-primary/40 mb-4" />
          {subtitle && <h2 className="text-2xl font-light">{subtitle}</h2>}
        </div>
      </div>
    </section>
  );
}

HeroHome.propTypes = {
  mediaId: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};
