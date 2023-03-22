import React from "react";
import "./article.scss";

function Article({ Articles }) {
  const url = process.env.PUBLIC_URL;

  return Articles.map((article) => {
    if (article.display === "enable") {
      return (
        <article className="article" id={article.id} key={article.id}>
          <div
            className="article__textarea"
            style={{ width: article.images.length > 0 ? "50%" : "100%" }}>
            <h3 className="article__textarea__title">{article.title}</h3>
            {article.text.map((ph) => (
              <p key={ph.id} className="article__textarea__paragraph">
                {ph.paragraph}
              </p>
            ))}
            {article.link.length > 0 ? (
              <div dangerouslySetInnerHTML={{ __html: article.link }} />
            ) : null}
          </div>
          {article.images.length > 0 ? (
            <div className="article__images">
              {article.images.map((image) => (
                <div className="article__images__image" id={image.id} key={image.id}>
                  <div className="article__images__image__container">
                    <img src={url + image.url} title={image.title} alt={image.alt} />
                  </div>
                  <span>{image.title}</span>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      );
    }
    return null;
  });
}

export default Article;
