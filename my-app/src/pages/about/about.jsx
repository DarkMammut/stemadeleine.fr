import React from "react";
import { Helmet } from "react-helmet";
import "./about.scss";
import SECTIONS from "../../assets/about.json";

function About() {
  const url = process.env.PUBLIC_URL;

  return (
    <main className="about">
      <Helmet>
        <title>Qui sommes nous ? | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <p className="about__paragraph">Hello</p>
      {SECTIONS.map((section) => (
        <section key={section.id} className="about__section">
          <div className="about__section__textarea">
            <h2 className="about__section__textarea__title">{section.title}</h2>
            <div className="about__section__textarea__text">
              {section.text.map((sectionText) => (
                <p className="about__section__textarea__text__paragraph" key={sectionText.id}>
                  {sectionText.paragraph}
                </p>
              ))}
            </div>
          </div>
          {section.images.length > 0 ? (
            <div className="about__section__images">
              {section.images.map((image) => (
                <div className="about__section__images__image" key={image.id}>
                  <div className="about__section__images__image__container">
                    <img src={url + image.url} title={image.title} alt={image.alt} />
                  </div>
                  <span>{image.title}</span>
                </div>
              ))}
            </div>
          ) : null}
          {section.article.length > 0 ? (
            <div className="about__section__articles">
              {section.article.map((art) => (
                <article key={art.id} className="about__section__articles__article">
                  <h3 className="about__section__articles__article__title">{art.title}</h3>
                  <div className="about__section__articles__article__text">
                    {art.text.map((articleText) => (
                      <p
                        className="about__section__articles__article__text__paragraph"
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

export default About;
