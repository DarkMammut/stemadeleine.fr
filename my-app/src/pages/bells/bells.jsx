import React from "react";
import content from "../../assets/bells_sections.json";

function Bells() {
  return (
    <main>
      <h1 className="bells__title">Les cloches de Sainte Madeleine de la Jarrie</h1>
      <p className="bells__paragraph">
        On atteint la salle des cloches de l’imposant clocher-porche du XIIe siècle en empruntant un
        escalier à vis. Cette salle abrite les 4 cloches de la Jarrie. Ce jeu est le plus gros
        pleinium de l’Aunis, et justifie qu’après quatorze ans de silence la municipalité ait offert
        aux Jariens la joie d’entendre à nouveau son patrimoins campanaire.
      </p>
      {content.map((section) => (
        <section key={section.id} className="bells__section">
          <h2 className="bells__section__title">{section.title}</h2>
          <p className="bells__section__text">{section.text}</p>
          {section.article.map((art) => (
            <article key={art.id} className="bells__section__article">
              <h3 className="bells__section__article__title">{art.title}</h3>
              <p className="bells__section__article__text">{art.text}</p>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}

export default Bells;
