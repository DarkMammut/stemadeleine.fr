import React from "react";
import { Helmet } from "react-helmet";
import "./bells.scss";
import SECTIONS from "../../assets/bells_sections.json";

document.title = "Les cloches";

function Bells() {
  const url = process.env.PUBLIC_URL;

  return (
    <main className="bells">
      <Helmet>
        <title>CLOCHES | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <p className="bells__paragraph">
        On atteint la salle des cloches de l’imposant clocher-porche du XIIe siècle en empruntant un
        escalier à vis. Cette salle abrite les 4 cloches de la Jarrie. Ce jeu est le plus gros
        pleinium de l’Aunis, et justifie qu’après quatorze ans de silence la municipalité ait offert
        aux Jariens la joie d’entendre à nouveau son patrimoins campanaire.
      </p>
      {SECTIONS.map((section) => (
        <section key={section.id} className="bells__section">
          <div className="bells__section__textarea">
            <h2 className="bells__section__textarea__title">{section.title}</h2>
            <div className="bells__section__textarea__text">
              {section.text.map((sectionText) => (
                <p className="bells__section__textarea__text__paragraph" key={sectionText.id}>
                  {sectionText.paragraph}
                </p>
              ))}
            </div>
          </div>
          {section.images.length > 0 ? (
            <div className="bells__section__images">
              {section.images.map((image) => (
                <div className="bells__section__images__image" key={image.id}>
                  <div className="bells__section__images__image__container">
                    <img src={url + image.url} title={image.title} alt={image.alt} />
                  </div>
                  <span>{image.title}</span>
                </div>
              ))}
            </div>
          ) : null}
          {section.article.length > 0 ? (
            <div className="bells__section__articles">
              {section.article.map((art) => (
                <article key={art.id} className="bells__section__articles__article">
                  <h3 className="bells__section__articles__article__title">{art.title}</h3>
                  <div className="bells__section__articles__article__text">
                    {art.text.map((articleText) => (
                      <p
                        className="bells__section__articles__article__text__paragraph"
                        key={articleText.id}>
                        {articleText.paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </main>
  );
}

export default Bells;
