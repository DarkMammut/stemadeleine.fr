import React from "react";
import { Helmet } from "react-helmet";
import NEWS from "../../assets/news.json";
import "./index.scss";

document.title = "Accueil";

function Home() {
  return (
    <main>
      <Helmet>
        <title>ACCUEIL | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <section id="news" className="news">
        <h2 className="news_title">Actualités</h2>
        {NEWS.map((article) => {
          if (article.display === "enable") {
            return (
              <article className="news__article" key={article.id}>
                <div className="news__article__textarea">
                  <h3 className="news__article__textarea__title">{article.title}</h3>
                  {article.paragraph.map((ph) => (
                    <p key={ph.id} className="news__article__textarea__paragraph">
                      {ph.text}
                    </p>
                  ))}
                </div>
                <div className="news__article__image">
                  <div className="news__article__image__container">
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

export default Home;
