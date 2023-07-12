import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import ImageSlider from "../../components/slider/slider";
import SLIDES from "../../assets/slides.json";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
  const [open, setOpen] = useState(0);

  useEffect(() => {
    if (open === 1) {
      setOpen(0);
    }
  }, [open]);

  return (
    <main id="home">
      <Helmet>
        <title>ACCUEIL | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <div className="container">
        <section>
          <p>
            L’association « Les Amis de Sainte Madeleine de La jarrie » a été créée pour défendre le
            patrimoine de la paroisse de La Jarrie, veiller à son entretien notamment avec la
            Mairie, de faire connaitre au public l’histoire de ce monument et et participer au
            développement, au rayonnement et à la rénovation de l&apos;église.
          </p>
        </section>
        <section className="carousel">
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <div className="gallery full-screen">
            {groupedItems.map((column) => (
              <div className="gallery__column" key={column}>
                {column.map((slide) => (
                  <div className="gallery__column__card" id={slide.id} key={slide.id}>
                    <figure className="gallery__column__card__thumb">
                      <img
                        src={slide.url}
                        alt={slide.alt}
                        className="gallery__column__card__thumb__image"
                      />
                      <figcaption className="gallery__column__card__thumb__caption">
                        {slide.title}
                      </figcaption>
                    </figure>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <ImageSlider slidesImages={SLIDES.home} openSlider={open} startIndex={1} />
        </section>
        <section>
          <p>
            Cette association a pour objectif d’être un outil au service de l’église et de la
            commune pour mener à bien des travaux de restauration du mobilier et de protection du
            patrimoine.
          </p>

          <p>
            Tous ces projets ne peuvent se faire que grâce au soutien de la commune de La Jarrie et
            avec l’accord du Curé de la paroisse. Cette association travaille en étroite
            collaboration avec ce dernier qui doit approuver tous les projets d’action de
            l’association, et avec la Mairie et la responsable de la Culture.
          </p>

          <p>L’association compte 29 adhérents</p>
        </section>
      </div>
    </main>
  );
}

export default Home;
