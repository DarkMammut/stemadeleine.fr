import React from "react";
import "./section.scss";

function Section({ Sections }) {
  const url = process.env.PUBLIC_URL;

  return Sections.map((section) => (
    <section key={section.id} className="section">
      <div className="section__textarea">
        <h2 className="section__textarea__title">{section.title}</h2>
        <div className="section__textarea__text">
          {section.text.map((sectionText) => (
            <p className="section__textarea__text__paragraph" key={sectionText.id}>
              {sectionText.paragraph}
            </p>
          ))}
        </div>
      </div>
      {section.images.length > 0 ? (
        <div className="section__images">
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
        <div className="section__articles">
          {section.article.map((art) => (
            <article key={art.id} className="section__articles__article">
              <h3 className="section__articles__article__title">{art.title}</h3>
              <div className="section__articles__article__text">
                {art.text.map((articleText) => (
                  <p className="section__articles__article__text__paragraph" key={articleText.id}>
                    {articleText.paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  ));
}

export default Section;
