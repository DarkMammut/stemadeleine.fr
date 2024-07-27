import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import Action from "../../assets/action.json";
import "./action.scss";

function findActions(id) {
  return Action.find((action) => action.id === id);
}

function Icone() {
  const navigate = useNavigate();
  const { id } = useParams();
  const action = useMemo(() => findActions(id), [id]);
  const url = process.env.PUBLIC_URL;

  useEffect(() => {
    if (!action) {
      navigate("/404");
    }
  }, [action]);

  useEffect(() => {
    window.scrollTo(0, 0);
  });

  if (!action) {
    return null;
  }

  return (
    <main id="icone">
      <div className="container">
        <article id={action.id} className="article d-flex justify-content-center">
          <div className="article__header d-flex">
            <figure className="article__header__image">
              <img src={url + action.image.url} title={action.image.title} alt={action.image.alt} />
              <figcaption className="article__header__image__caption">
                {action.image.title}
              </figcaption>
            </figure>
            <div className="article__header__text d-flex">
              <h2 className="article__header__text__title">{action.title}</h2>
              <div className="article__header__text__paragraph">{parse(action.text)}</div>
            </div>
          </div>
          {action.section.map((section) => (
            <section key={section.id} className="article__section">
              {section.title ? <h3 className="article__section__title">{section.title}</h3> : null}
              <div className="article__section__text">{parse(section.text)}</div>
            </section>
          ))}
          <div className="article__footer">{parse(action.conclusion)}</div>
        </article>
        <button className="btn--back no-style-btn" type="button" onClick={() => navigate(-1)}>
          Retour
        </button>
      </div>
    </main>
  );
}

export default Icone;
