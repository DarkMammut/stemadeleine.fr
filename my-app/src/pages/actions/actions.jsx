import React, { useEffect } from "react";
import Section from "../../components/section/section";
import SectionsData from "../../assets/actions.json";
import "./actions.scss";

function Realisation() {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <main id="actions">
      <div className="container">
        <Section Sections={SectionsData} />
      </div>
    </main>
  );
}

export default Realisation;
