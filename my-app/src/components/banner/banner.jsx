import React, { useState } from "react";

import "./banner.scss";

function Banner({ content }) {
  const [scrolldown, setScrolldown] = useState(0);
  return (
    <div className="banner">
      <div className="banner__textarea">
        <h1 className="banner__textarea__title">{content.title}</h1>
        <span className="banner__textarea__subhead">{content.subhead}</span>
      </div>
      <button
        className="banner__down"
        type="button"
        onClick={() => setScrolldown(scrolldown ? 0 : 1)}>
        <div className="banner__down__chevron">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </div>
      </button>
    </div>
  );
}

export default Banner;
