import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import NewsLetter from "../../assets/newsletter.json";
import "./news.scss";

function findNews(id) {
  return NewsLetter.find((news) => news.id === id);
}

function News() {
  const navigate = useNavigate();
  const { id } = useParams();
  const news = useMemo(() => findNews(id), [id]);
  const url = process.env.PUBLIC_URL;

  useEffect(() => {
    if (!news) {
      navigate("/404");
    }
  }, [news]);

  if (!news) {
    return null;
  }

  return (
    <main id="news">
      <div className="constainer">
        <article id={news.id} className="article">
          <div className="article__header">
            <h2 className="article__header__title">{news.title}</h2>
            <div className="article__header__text">{parse(news.text)}</div>
            <figure className="article__header__image">
              <img src={url + news.image.url} title={news.image.title} alt={news.image.alt} />
              <figcaption>{news.image.title}</figcaption>
            </figure>
          </div>
          {news.section.map((section) => (
            <section key={section.id} className="article__section">
              {section.title ? <h3 className="article__section__title">{section.title}</h3> : null}
              <p className="article__section__text">{section.text}</p>
            </section>
          ))}
          <div className="article__footer">{parse(news.conclusion)}</div>
        </article>
      </div>
    </main>
  );
}

export default News;
