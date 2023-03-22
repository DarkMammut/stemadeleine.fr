import React from "react";
import Article from "../article/article";
import "./section.scss";

function Section({ Sections }) {
  const url = process.env.PUBLIC_URL;

  return Sections.map((section) => (
    <section key={section.id} className="section" id={section.id}>
      <h2 className="section__title">{section.title}</h2>
      <div className="section__container">
        <div
          className="section__textarea"
          style={{ width: section.images.length > 0 ? "50%" : "100%" }}>
          <div className="section__textarea__text">
            {section.text.map((sectionText) => (
              <p className="section__textarea__text__paragraph" key={sectionText.id}>
                {sectionText.paragraph}
              </p>
            ))}
          </div>
          <div className="section__articles">
            {section.article.length > 0 ? <Article Articles={section.article} /> : null}
          </div>
        </div>
        {section.images.length > 0 ? (
          <div className="section__images">
            {section.images.map((image) => (
              <div className="section__images__image" key={image.id}>
                <div className="section__images__image__container">
                  <img src={url + image.url} title={image.title} alt={image.alt} />
                </div>
                <span>{image.title}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  ));
}

export default Section;
