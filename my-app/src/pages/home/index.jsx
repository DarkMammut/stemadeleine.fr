import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import ImageSlider from "../../components/slider/slider";
import SLIDES from "../../assets/slides.json";
import NewsLetter from "../../assets/newsletter.json";
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
  const [open, setOpen] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

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
          <section className="carousel">
            <div className="gallery full-screen">
              {groupedItems.map((column) => (
                <div className="gallery__column" key={Math.random()}>
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
          </section>
        </article>
        <article className="article d-flex justify-content-center">
          {NewsLetter.map((news) => (
            <section key={news.id} className="article__section">
              <Link to={domain + news.id}>
                <div className="news d-flex justify-content-center">
                  <div
                    className="news__image"
                    style={{ backgroundImage: `url(${url} ${news.image.url})` }}
                  />
                  <div className="news__text">{parse(news.text)}</div>
                </div>
              </Link>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}

export default Home;
