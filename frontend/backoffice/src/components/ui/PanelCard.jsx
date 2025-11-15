"use client";

import React from "react";
import PropTypes from "prop-types";

export default function PanelCard({
  data = {},
  titleField = "name",
  titleRender = null,
  loading = false,
  className = "",
  children = null,
  actions = null,
}) {
  const titleNode = () => {
    if (typeof titleRender === "function")
      return titleRender({ data, loading });
    if (loading)
      return <div className={"skeleton-light w-52 h-5 inline-block"} />;
    const v = data ? data[titleField] : null;
    return (
      <div className={"text-base font-semibold text-gray-800 truncate"}>
        {v || "Adresse"}
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-lg bg-white shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0">{titleNode()}</div>
            {/* place for actions will be rendered on the right by the parent via `actions` prop */}
          </div>

          <div className={`mt-2 text-gray-700`}>{children}</div>
        </div>

        {actions ? <div className="ml-3">{actions}</div> : null}
      </div>
    </div>
  );
}

PanelCard.propTypes = {
  data: PropTypes.object,
  titleField: PropTypes.string,
  titleRender: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  actions: PropTypes.node,
};

PanelCard.defaultProps = {
  data: {},
  titleField: "name",
  titleRender: null,
  loading: false,
  className: "",
  children: null,
  actions: null,
};
