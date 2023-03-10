import React from "react";
import "./article.scss";

function Article({ Articles }) {
  const url = process.env.PUBLIC_URL;

  return Articles.map((article) => {
    if (article.display === "enable") {
      return (
        <article className="article" key={article.id}>
          <div
            className="article__textarea"
            style={{ width: article.image.length > 0 ? "50%" : "100%" }}>
            <h2 className="article__textarea__title">{article.title}</h2>
            {article.paragraph.map((ph) => (
              <p key={ph.id} className="article__textarea__paragraph">
                {ph.text}
              </p>
            ))}
          </div>
          {article.image.length > 0 ? (
            <div className="article__image">
              <div className="article__image__container">
                <img
                  src={url + article.image.url}
                  title={article.image.title}
                  alt={article.image.alt}
                />
              </div>
              <span>{article.image.title}</span>
            </div>
          ) : null}
        </article>
      );
    }
    return null;
  });
}

export default Article;
