import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Slider from "react-slick";
import ImageSlider from "../../components/slider/slider";
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
    slidesToShow: 3,
    slidesToScroll: 1,
    focusOnSelect: true,
    centerPadding: "60px",
    centerMode: true,
    variableWidth: true,
    autoplay: true,
    autoplaySpeed: 15000,
    responsive: [
      {
        breakpoint: 1224,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          fade: true,
          centerPadding: 0
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
      <section>
        <p>
          L’association « Les Amis de Sainte Madeleine de La jarrie » a été créée pour défendre le
          patrimoine de la paroisse de La Jarrie, veiller à son entretien notamment avec la Mairie,
          de faire connaitre au public l’histoire de ce monument et et participer au développement,
          au rayonnement et à la rénovation de l&apos;église.
        </p>
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
        <ImageSlider slidesImages={SLIDES.home} openSlider={open} startIndex={currentIndex} />
      </section>
      <section>
        <p>
          Cette association a pour objectif d’être un outil au service de l’église et de la commune
          pour mener à bien des travaux de restauration du mobilier et de protection du patrimoine.
        </p>

        <p>
          Tous ces projets ne peuvent se faire que grâce au soutien de la commune de La Jarrie et
          avec l’accord du Curé de la paroisse. Cette association travaille en étroite collaboration
          avec ce dernier qui doit approuver tous les projets d’action de l’association, et avec la
          Mairie et la responsable de la Culture.
        </p>

        <p>L’association compte 29 adhérents</p>
      </section>
    </main>
  );
}

export default Home;
