import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import ImageSlider from "../slider/slider";
import "./article.scss";

function Article({ Articles }) {
  const url = process.env.PUBLIC_URL;
  const [open, setOpen] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeArticle, setActiveArticle] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (open === 1) {
      setOpen(0);
    }
  }, [open]);

  const handleClick = (slide, active) => {
    const index = active.images.findIndex((slides) => slides === slide);
    setActiveArticle(active);
    setSlideIndex(index);
    setOpen(1);
  };

  const handleClickNavigate = (link) => {
    const currentPath = location.pathname.split("/")[1]; // Récupère la section principale de l'URL
    navigate(`/${currentPath}/${link}`);
  };

  return (
    <div>
      {Articles.map((article) => {
        if (article.display === "enable") {
          return (
            <article className="article" id={article.id} key={article.id}>
              <div
                className="article__textarea"
                data-images={article.images.length > 0 ? "1" : "0"}>
                <h3 className="article__textarea__title">{article.title}</h3>
                {article.text?.map((ph) => (
                  <div key={ph.id} className="article__textarea__paragraph">
                    {parse(ph.paragraph)}
                  </div>
                ))}
                {article.button === "enable" ? (
                  <div className="article__textarea__button">
                    <button
                      className="btn btn--navigate no-style-btn"
                      type="button"
                      onClick={() => handleClickNavigate(article.link)}>
                      Suite =&gt;
                    </button>
                  </div>
                ) : null}
              </div>
              {article.images.length > 0 ? (
                <div className="article__images">
                  {article.images.map((image) => (
                    <button
                      className="article__images__frame no-style-btn"
                      id={image.id}
                      key={image.id}
                      type="button"
                      onClick={() => {
                        handleClick(image, article);
                      }}>
                      <div className="article__images__frame__image">
                        <img src={url + image.url} title={image.title} alt={image.alt} />
                      </div>
                      <span>{image.title}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          );
        }
        return null;
      })}
      {Object.keys(activeArticle).length > 0 ? (
        <ImageSlider
          slidesImages={activeArticle.images}
          openSlider={open}
          startSlide={slideIndex}
        />
      ) : null}
    </div>
  );
}

export default Article;
