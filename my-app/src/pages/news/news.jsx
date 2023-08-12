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
      <div className="container">
        <article id={news.id} className="article d-flex justify-content-center">
          <div className="article__header d-flex">
            <figure className="article__header__image">
              <img src={url + news.image.url} title={news.image.title} alt={news.image.alt} />
              <figcaption className="article__header__image__caption">
                {news.image.title}
              </figcaption>
            </figure>
            <div className="article__header__text d-flex">
              <h2 className="article__header__text__title">{news.title}</h2>
              <div className="article__header__text__paragraph">{parse(news.text)}</div>
            </div>
          </div>
          {news.section.map((section) => (
            <section key={section.id} className="article__section">
              {section.title ? <h3 className="article__section__title">{section.title}</h3> : null}
              <div className="article__section__text">{parse(section.text)}</div>
            </section>
          ))}
          <div className="article__footer">{parse(news.conclusion)}</div>
        </article>
        <button className="btn--back no-style-btn" type="button" onClick={() => navigate(-1)}>
          Retour
        </button>
      </div>
    </main>
  );
}

export default News;
