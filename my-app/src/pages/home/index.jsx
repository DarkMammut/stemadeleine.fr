import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Slider from "react-slick";
import ImageSlider from "../../components/slider/slider";
import NEWS from "../../assets/news.json";
import SLIDES from "../../assets/slides.json";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.scss";

function Home() {
  const url = process.env.PUBLIC_URL;
  const [open, setOpen] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const settings = {
    dots: true,
    lazyLoad: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    focusOnSelect: true,
    centerPadding: "60px",
    centerMode: true,
    variableWidth: true,
    autoplay: true,
    autoplaySpeed: 1500,
    responsive: [
      {
        breakpoint: 1224,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  };

  useEffect(() => {
    if (open === 1) {
      setOpen(0);
    }
  }, [open]);

  function handleKeyDown(e) {
    switch (e.key) {
      case "space":
        setOpen(1);
        break;

      default:
    }
  }

  return (
    <main>
      <Helmet>
        <title>ACCUEIL | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <section className="news">
        <h2 id="news" className="news__title">
          Actualités
        </h2>
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

      <section className="carousel">
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Slider {...settings}>
          {SLIDES.home.map((slide, index) => (
            <button
              className="carousel__slide"
              key={slide.id}
              onClick={() => {
                setCurrentIndex(index);
                setOpen(1);
              }}
              onKeyDown={handleKeyDown}
              type="button">
              <img
                className="carousel__slide__image"
                src={url + slide.url}
                title={slide.title}
                alt={slide.alt}
              />
            </button>
          ))}
        </Slider>
        <ImageSlider slidesImages={SLIDES.home} openslider={open} startindex={currentIndex} />
      </section>
    </main>
  );
}

export default Home;
