import React from "react";
import Section from "../../components/section/section";
import SectionData from "../../assets/project_sections.json";
import "./project.scss";

function Project() {
  return (
    <main id="project">
      <div className="container">
        <article>
          <Section Sections={SectionData} />
        </article>
      </div>
    </main>
  );
}

export default Project;
