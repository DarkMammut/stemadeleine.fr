import React from "react";

// Context used to signal whether child forms should render their own Panel.
// Default is `true` (forms render their Panel). Parent components like EditablePanel
// can provide `false` to instruct nested MyForm components not to render an extra panel.
export const FormPanelContext = React.createContext(true);
export default FormPanelContext;
