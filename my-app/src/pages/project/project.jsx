import React from "react";
import { Helmet } from "react-helmet";
import Section from "../../components/section/section";
import SectionData from "../../assets/project_sections.json";
import "./project.scss";

function Project() {
  return (
    <main>
      <Helmet>
        <title>PROJETS | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <div className="container">
        <article>
          <Section Sections={SectionData} />
        </article>
      </div>
    </main>
  );
}

export default Project;
