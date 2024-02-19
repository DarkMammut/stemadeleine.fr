import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import ImageSlider from "../../components/slider/slider";
import SLIDES from "../../assets/slides.json";
import NewsLetter from "../../assets/newsletter.json";
import News from "../../assets/news.json";
import "./index.scss";

const groupedItems = SLIDES.home.reduce(
  (acc, item) => {
    if (acc[acc.length - 1].length >= 3) {
      return [...acc, [item]];
    }
    acc[acc.length - 1].push(item);
    return acc;
  },
  [[]]
);

function Home() {
  const domain = "/newsletter/";
  const url = process.env.PUBLIC_URL;
  const lastNewsletter = NewsLetter[NewsLetter.length - 1];
  const [open, setOpen] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (open === 1) {
      setOpen(0);
    }
  }, [open]);

  const handleClick = (slide) => {
    const index = SLIDES.home.findIndex((slides) => slides === slide);
    setSlideIndex(index);
    setOpen(1);
  };

  const handleClickNavigate = () => {
    navigate("/newsletter"); // Navigates to the "/newsletter" route
  };

  return (
    <main id="home">
      <div className="container">
        <article>
          <h3 id="welcome" className="full-screen">
            Bienvenue sur le site de l&apos;association des Amis de Sainte Madeleine de La Jarrie.
          </h3>
          <section>
            <p>
              L’association « Les Amis de Sainte Madeleine de La jarrie » a été créée pour défendre
              le patrimoine de la paroisse de La Jarrie, veiller à son entretien notamment avec la
              Mairie, de faire connaitre au public l’histoire de ce monument et et participer au
              développement, au rayonnement et à la rénovation de l&apos;église.
            </p>
          </section>
        </article>
        <div className="carousel full-screen">
          <div className="gallery d-flex justify-content-center">
            {groupedItems.map((column) => (
              <div className="gallery__column d-flex" key={Math.random()}>
                {column.map((slide) => (
                  <button
                    className="gallery__column__card no-style-btn"
                    id={slide.id}
                    key={slide.id}
                    type="button"
                    onClick={() => {
                      handleClick(slide);
                    }}>
                    <figure className="gallery__column__card__thumb">
                      <img
                        src={url + slide.url}
                        alt={slide.alt}
                        className="gallery__column__card__thumb__image"
                      />
                      <figcaption className="gallery__column__card__thumb__caption">
                        {slide.title}
                      </figcaption>
                    </figure>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <ImageSlider slidesImages={SLIDES.home} openSlider={open} startSlide={slideIndex} />
        </div>
        <div className="news-container">
          <h3 className="title">EN CE MOMENT DANS L’EGLISE DE LA JARRIE </h3>
          <ul className="news-list d-flex">
            {News.map((news) => {
              if (news.enable === "enable") {
                return (
                  <li key={news.id} className="d-flex justify-content-center">
                    <div className="progressBar d-flex justify-content-center">
                      <div className="progressBar__dot">
                        <div className="progressBar__dot__top" />
                        <div className="progressBar__dot__bottom" />
                      </div>
                    </div>
                    <div className="news d-flex justify-content-center">
                      <div
                        className="news__image"
                        style={{ backgroundImage: `url(${url} ${news.image.url})` }}
                      />
                      <div className="news__text">
                        <h4>{news.title}</h4>
                        <div>{parse(news.text)}</div>
                      </div>
                    </div>
                  </li>
                );
              }
              return null; // Renvoyer null si news.enable n'est pas "enable"
            })}
          </ul>
        </div>
        <div className="newsletter-container d-flex justify-content-center">
          <h3 className="title">Newsletter</h3>
          <Link to={domain + lastNewsletter.id}>
            <div id={lastNewsletter.id} className="newsletter d-flex justify-content-center">
              <div
                className="newsletter__image"
                style={{ backgroundImage: `url(${url} ${lastNewsletter.image.url})` }}
              />
              <div className="newsletter__text">
                <h4>{lastNewsletter.title}</h4>
                <div>{parse(lastNewsletter.text)}</div>
              </div>
            </div>
          </Link>
          <button
            className="btn btn--navigate no-style-btn"
            type="button"
            onClick={handleClickNavigate}>
            Plus de newsletters
          </button>
        </div>
      </div>
    </main>
  );
}

export default Home;
