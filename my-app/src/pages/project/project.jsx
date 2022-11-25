import React from "react";
import { Helmet } from "react-helmet";
import ARTICLES from "../../assets/project_articles.json";
import "./project.scss";

function Project() {
  return (
    <main>
      <Helmet>
        <title>PROJETS | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <section className="projects">
        {ARTICLES.map((article) => {
          if (article.display === "enable") {
            return (
              <article className="projects__article" key={article.id}>
                <div className="projects__article__text">
                  <h2 className="projects__article__text__title">{article.title}</h2>
                  {article.paragraph.map((ph) => (
                    <p key={ph.id} className="projects__article__text__paragraph">
                      {ph.text}
                    </p>
                  ))}
                </div>
                <div className="projects__article__image">
                  <div className="projects__article__image__container">
                    <img
                      src={process.env.PUBLIC_URL + article.image.url}
                      title={article.image.title}
                      alt={article.image.alt}
                    />
                  </div>
                  <span>{article.image.title}</span>
                </div>
              </article>
            );
          }
          return null;
        })}
      </section>
    </main>
  );
}

export default Project;
