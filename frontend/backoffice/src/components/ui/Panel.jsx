import React, { cloneElement } from "react";
import PropTypes from "prop-types";

export default function Panel({
  title,
  icon: Icon = null,
  actions,
  actionsPrimary,
  actionsSecondary,
  children,
  className = "",
  footer,
  footerDivider = false,
}) {
  // helper to add classes to passed element(s) without overwriting existing className
  const enhance = (node, extra) => {
    if (!node) return null;
    return React.Children.map(node, (child) => {
      if (React.isValidElement(child)) {
        const prev = child.props.className || "";
        return cloneElement(child, {
          className: `${prev} ${extra}`.trim(),
        });
      }
      // if it's not a React element (string/node), wrap it
      return <div className={extra}>{child}</div>;
    });
  };
  return (
    <div
      className={`bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-col items-start justify-between px-4 py-6 border-b border-gray-200 sm:flex-row sm:items-center sm:px-8 sm:pt-8 sm:pb-4">
          {/* Render title: if a React node is passed, render it as-is (so it can include custom icon/badge). Otherwise render icon + title string. */}
          {title ? (
            React.isValidElement(title) ? (
              <div className="flex items-center gap-3">{title}</div>
            ) : (
              <div className="flex items-center gap-3">
                {Icon && <Icon className="w-6 h-6 text-gray-500" />}
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
            )
          ) : (
            <div />
          )}

          {/* If actionsPrimary provided, render it full-width on mobile and show secondary actions appropriately */}
          {actionsPrimary ? (
            <div className="mt-3 w-full flex flex-col items-start gap-2 sm:mt-0 sm:flex-row sm:items-center sm:w-auto">
              <div className="w-full sm:w-auto">
                {enhance(actionsPrimary, "w-full sm:w-auto")}
              </div>
              {actionsSecondary && (
                <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
                  {enhance(actionsSecondary, "")}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 w-full flex flex-wrap items-center gap-2 sm:mt-0 sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-6 sm:p-8">{children}</div>

      {footer && (
        <div
          className={`px-4 py-4 sm:px-8 ${
            footerDivider ? "border-t border-gray-200" : ""
          }`}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

Panel.propTypes = {
  title: PropTypes.node,
  icon: PropTypes.elementType,
  actions: PropTypes.node,
  actionsPrimary: PropTypes.node,
  actionsSecondary: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  footer: PropTypes.node,
  footerDivider: PropTypes.bool,
};

Panel.defaultProps = {
  title: null,
  icon: null,
  actions: null,
  actionsPrimary: null,
  actionsSecondary: null,
  className: "",
  footer: null,
  footerDivider: false,
};
