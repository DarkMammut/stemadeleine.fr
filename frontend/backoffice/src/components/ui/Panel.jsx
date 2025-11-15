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
  loading = false,
}) {
  // helper to add classes to passed element(s) without overwriting existing className
  const enhance = (node, extraClass, extraProps = {}) => {
    if (!node) return null;
    // If node itself is a React element and is a Fragment, iterate its children
    if (React.isValidElement(node) && node.type === React.Fragment) {
      // Map fragment children and add props to each non-fragment element.
      return React.Children.map(node.props.children, (child) => {
        if (!React.isValidElement(child)) {
          return (
            <div className={extraClass} {...extraProps}>
              {child}
            </div>
          );
        }
        // If this child is a Fragment, recurse into its children (do NOT add props to the Fragment itself)
        if (child.type === React.Fragment) {
          return React.Children.map(child.props.children, (fragChild) => {
            if (!React.isValidElement(fragChild)) {
              return (
                <div className={extraClass} {...extraProps}>
                  {fragChild}
                </div>
              );
            }
            // If fragChild is also a Fragment, recurse one more level
            if (fragChild.type === React.Fragment) {
              return React.Children.map(fragChild.props.children, (deep) => {
                if (React.isValidElement(deep)) {
                  const prev = deep.props.className || "";
                  return cloneElement(deep, {
                    className: `${prev} ${extraClass}`.trim(),
                    ...extraProps,
                  });
                }
                return (
                  <div className={extraClass} {...extraProps}>
                    {deep}
                  </div>
                );
              });
            }
            const prev = fragChild.props.className || "";
            return cloneElement(fragChild, {
              className: `${prev} ${extraClass}`.trim(),
              ...extraProps,
            });
          });
        }

        // Normal element: clone and add class/props
        const prev = child.props.className || "";
        return cloneElement(child, {
          className: `${prev} ${extraClass}`.trim(),
          ...extraProps,
        });
      });
    }

    return React.Children.map(node, (child) => {
      if (React.isValidElement(child)) {
        // If the child is a Fragment, recurse into its children instead of adding props to the Fragment
        if (child.type === React.Fragment) {
          return React.Children.map(child.props.children, (fragChild) => {
            if (!React.isValidElement(fragChild)) {
              return (
                <div className={extraClass} {...extraProps}>
                  {fragChild}
                </div>
              );
            }
            if (fragChild.type === React.Fragment) {
              return React.Children.map(fragChild.props.children, (deep) => {
                if (React.isValidElement(deep)) {
                  const prev = deep.props.className || "";
                  return cloneElement(deep, {
                    className: `${prev} ${extraClass}`.trim(),
                    ...extraProps,
                  });
                }
                return (
                  <div className={extraClass} {...extraProps}>
                    {deep}
                  </div>
                );
              });
            }
            const prev = fragChild.props.className || "";
            return cloneElement(fragChild, {
              className: `${prev} ${extraClass}`.trim(),
              ...extraProps,
            });
          });
        }
        const prev = child.props.className || "";
        // Merge className and spread extraProps (e.g., disabled)
        return cloneElement(child, {
          className: `${prev} ${extraClass}`.trim(),
          ...extraProps,
        });
      }
      // if it's not a React element (string/node), wrap it
      return (
        <div className={extraClass} {...extraProps}>
          {child}
        </div>
      );
    });
  };
  return (
    <div
      className={`bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl ${className}`}
      aria-busy={loading}
    >
      {(title || actions) && (
        <div
          className={`flex flex-col items-start justify-between px-4 py-6 border-b border-gray-200 sm:flex-row sm:items-center sm:px-8 sm:pt-8 sm:pb-4 ${
            loading ? "skeleton-pulse pointer-events-none" : ""
          }`}
        >
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
                {enhance(actionsPrimary, "w-full sm:w-auto", {
                  disabled: loading,
                })}
              </div>
              {actionsSecondary && (
                <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
                  {enhance(actionsSecondary, "", { disabled: loading })}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 w-full flex flex-wrap items-center gap-2 sm:mt-0 sm:w-auto">
              {enhance(actions, "", { disabled: loading })}
            </div>
          )}
        </div>
      )}

      <div
        className={`px-4 py-6 sm:p-8 ${loading ? "skeleton-pulse pointer-events-none" : ""}`}
      >
        {children}
      </div>

      {footer && (
        <div
          className={`px-4 py-4 sm:px-8 ${
            footerDivider ? "border-t border-gray-200" : ""
          }`}
        >
          {React.Children.map(footer, (child) => {
            // If footer contains buttons, disable them when loading
            if (React.isValidElement(child)) {
              return cloneElement(child, { disabled: loading });
            }
            return child;
          })}
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
  loading: PropTypes.bool,
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
  loading: false,
};
