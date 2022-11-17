import React from "react";
import "./project.scss";
import image from "../../assets/tableau.png";

function Project() {
  return (
    <main>
      <h1 className="title">Nos projets</h1>
      <section className="project">
        <h2 className="project__title">Tableau de Sainte Madeleine</h2>
        <div className="project__image">
          <img src={image} title="Saint Madeleine" alt="tableau de Sainte Madeleine" />
        </div>

        <p className="project__paragraph">
          ljsdgljqbnwvnjqvjlb slqjbnvjlqnljvnbqjlbvjbjqkblvjblqjsbnvljbnq,lnbclj ml
        </p>
      </section>
    </main>
  );
}

export default Project;
