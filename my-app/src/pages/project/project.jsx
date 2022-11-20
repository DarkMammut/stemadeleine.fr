import React from "react";
import { Helmet } from "react-helmet";
import "./project.scss";
import Banner from "../../components/banner/banner";

function Project() {
  return (
    <main>
      <Helmet>
        <title>PROJETS | Les amis de Sainte Madeleine de la Jarrie</title>
      </Helmet>
      <Banner />
      <section className="project">
        <h2 className="project__title">Tableau de Marie Madeleine</h2>
        <div className="project__image">
          <img
            src={`${process.env.PUBLIC_URL}/tableau.png`}
            title="Saint Madeleine"
            alt="tableau de Sainte Madeleine"
          />
        </div>

        <p className="project__paragraph">
          ljsdgljqbnwvnjqvjlb slqjbnvjlqnljvnbqjlbvjbjqkblvjblqjsbnvljbnq,lnbclj ml
        </p>
      </section>
    </main>
  );
}

export default Project;
