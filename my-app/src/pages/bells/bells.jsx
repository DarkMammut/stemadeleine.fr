import React from "react";
import { Helmet } from "react-helmet";
import "./bells.scss";
import content from "../../assets/bells_sections.json";
import Banner from "../../components/banner/banner";

document.title = "Les cloches";

function Bells() {
  return (
    <main className="bells">
      <Helmet>
        <title>CLOCHES | Les amis de Sainte Madeleine de la Jarrie</title>
      </Helmet>
      <Banner />
      <p className="bells__paragraph">
        On atteint la salle des cloches de l’imposant clocher-porche du XIIe siècle en empruntant un
        escalier à vis. Cette salle abrite les 4 cloches de la Jarrie. Ce jeu est le plus gros
        pleinium de l’Aunis, et justifie qu’après quatorze ans de silence la municipalité ait offert
        aux Jariens la joie d’entendre à nouveau son patrimoins campanaire.
      </p>
      {content.map((section) => (
        <section key={section.id} className="bells__section">
          <div className="bells__section__textarea">
            <h2 className="bells__section__textarea__title">{section.title}</h2>
            <p className="bells__section__textarea__text">{section.text}</p>
          </div>
          <div className="bells__section__articles">
            {section.article.map((art) => (
              <article key={art.id} className="bells__section__articles__article">
                <h3 className="bells__section__articles__article__title">{art.title}</h3>
                <p className="bells__section__articles__article__text">{art.text}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

export default Bells;
