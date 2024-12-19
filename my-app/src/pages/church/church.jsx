import React, { useEffect } from "react";
import Section from "../../components/section/section";
import "./church.scss";
import SectionsData from "../../assets/church.json";

function Church() {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <main id="church">
      <div className="container">
        {/* <p className="church__paragraph"></p> */}
        <Section Sections={SectionsData} />
      </div>
    </main>
  );
}

export default Church;
