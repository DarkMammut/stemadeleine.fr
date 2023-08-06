import React from "react";
import { Helmet } from "react-helmet";
import Section from "../../components/section/section";
import SectionData from "../../assets/realisations.json";
import "./realisation.scss";

function Realisation() {
  return (
    <main id="realisations">
      <Helmet>
        <title>REALISATIONS | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <div className="container">
        <article>
          <Section Sections={SectionData} />
        </article>
      </div>
    </main>
  );
}

export default Realisation;
