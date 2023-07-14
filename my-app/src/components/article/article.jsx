import React from "react";
import parse from "html-react-parser";
import Section from "../section/section";
import "./article.scss";

function Article({ Articles }) {
  const url = process.env.PUBLIC_URL;

  return Articles.map((article) => (
    <article key={article.id} className="article" id={article.id}>
      <h2 className="article__title">{article.title}</h2>
      <div className="article__container">
        <div
          className="article__textarea"
          style={{ width: article.images.length > 0 ? "50%" : "100%" }}>
          <div className="article__textarea__text">
            {article.text?.map((articleText) => (
              <div key={articleText.id} className="article__textarea__text__paragraph">
                {parse(articleText.paragraph)}
              </div>
            ))}
          </div>
          <div className="article__sections">
            {article.section.length > 0 ? <Section Sections={article.section} /> : null}
          </div>
        </div>
        {article.images.length > 0 ? (
          <div className="article__images">
            {article.images.map((image) => (
              <div className="article__images__image" key={image.id}>
                <div className="article__images__image__container">
                  <img src={url + image.url} title={image.title} alt={image.alt} />
                </div>
                <span>{image.title}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  ));
}

export default Article;
