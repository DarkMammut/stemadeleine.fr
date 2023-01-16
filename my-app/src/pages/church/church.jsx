import React from "react";
import { Helmet } from "react-helmet";
import "./church.scss";
import SECTIONS from "../../assets/church.json";

function Church() {
  const url = process.env.PUBLIC_URL;

  return (
    <main className="church">
      <Helmet>
        <title>ASSOCIATION | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <p className="church__paragraph">Hello</p>
      {SECTIONS.map((section) => (
        <section key={section.id} className="church__section">
          <div className="church__section__textarea">
            <h2 className="church__section__textarea__title">{section.title}</h2>
            <div className="church__section__textarea__text">
              {section.text.map((sectionText) => (
                <p className="church__section__textarea__text__paragraph" key={sectionText.id}>
                  {sectionText.paragraph}
                </p>
              ))}
            </div>
          </div>
          {section.images.length > 0 ? (
            <div className="church__section__images">
              {section.images.map((image) => (
                <div className="church__section__images__image" key={image.id}>
                  <div className="church__section__images__image__container">
                    <img src={url + image.url} title={image.title} alt={image.alt} />
                  </div>
                  <span>{image.title}</span>
                </div>
              ))}
            </div>
          ) : null}
          {section.article.length > 0 ? (
            <div className="church__section__articles">
              {section.article.map((art) => (
                <article key={art.id} className="church__section__articles__article">
                  <h3 className="church__section__articles__article__title">{art.title}</h3>
                  <div className="church__section__articles__article__text">
                    {art.text.map((articleText) => (
                      <p
                        className="church__section__articles__article__text__paragraph"
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

export default Church;
