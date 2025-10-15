import React, { useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import useGetMedia from "../hooks/useGetMedia";
import useGetContents from "../hooks/useGetContents";
import Contents from "./Contents";

const Section = ({
  sectionId,
  title,
  mediaId,
  contents: staticContents = [],
  children,
  align = "left",
  className = "",
}) => {
  const { mediaUrl } = useGetMedia(mediaId);
  const {
    contents: apiContents,
    loading,
    fetchContentsByOwnerId,
  } = useGetContents();

  useEffect(() => {
    if (sectionId) fetchContentsByOwnerId(sectionId).catch(console.error);
  }, [sectionId, fetchContentsByOwnerId]);

  const contents = sectionId ? apiContents : staticContents;

  return (
    <section
      className={clsx("w-full py-16 md:py-20", "bg-transparent", className)}
    >
      <div
        className={clsx(
          "container mx-auto flex flex-col md:flex-row items-start gap-10 md:gap-16",
          align === "right" && "md:flex-row-reverse",
        )}
      >
        {/* Texte */}
        <div className="flex-1">
          <div className="flex items-center mb-10 gap-6 ">
            {/* Image */}
            {mediaId && mediaUrl && (
              <div className="flex-shrink-0 md:w-1/5 w-full">
                <img
                  src={mediaUrl}
                  alt={title || "Image de section"}
                  className="w-full h-auto rounded-xl object-cover shadow-sm"
                  loading="lazy"
                />
              </div>
            )}
            {title && (
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl mb-6 justify-self-start">
                {title}
              </h2>
            )}
          </div>

          <Contents
            contents={contents}
            loading={loading && sectionId}
            loadingMessage="Chargement des contenus..."
          />
          <div className="border-b-2"></div>

          {children && (
            <>
              <hr className="my-10 border-gray-200 dark:border-gray-700" />
              <div>{children}</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

Section.propTypes = {
  sectionId: PropTypes.string,
  title: PropTypes.string,
  mediaId: PropTypes.string,
  contents: PropTypes.array,
  children: PropTypes.node,
  align: PropTypes.oneOf(["left", "center", "right"]),
  className: PropTypes.string,
};

export default Section;
