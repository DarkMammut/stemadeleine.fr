import React, { useEffect } from "react";
import Section from "../../components/section/section";
import SectionData from "../../assets/actions.json";
import "./actions.scss";

function Realisation() {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <main id="actions">
      <div className="container">
        <article>
          <Section Sections={SectionData} />
        </article>
      </div>
    </main>
  );
}

export default Realisation;
