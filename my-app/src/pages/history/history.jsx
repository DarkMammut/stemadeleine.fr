import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import ImageSlider from "../../components/slider/slider";
import SLIDES from "../../assets/slides.json";
import "./history.scss";

function History() {
  const url = process.env.PUBLIC_URL;
  const pictureIndex = 0;
  const [open, setOpen] = useState(0);

  useEffect(() => {
    if (open === 1) {
      setOpen(0);
    }
  }, [open]);

  function handleKeyDown(e) {
    if (e.key === "space") {
      setOpen(1);
    }
  }

  return (
    <main>
      <Helmet>
        <title>HISTOIRE | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <section className="history">
        <article className="history__article">
          <div className="history__article__image">
            <button
              className="history__article__image__container"
              onClick={() => setOpen(1)}
              onKeyDown={handleKeyDown}
              type="button"
              tabIndex={0}>
              <img
                className="history__article__image__container__picture"
                src={url + SLIDES.history[pictureIndex].url}
                alt={SLIDES.history[pictureIndex].alt}
                title={SLIDES.history[pictureIndex].title}
              />
            </button>
            <ImageSlider
              slidesImages={SLIDES.history}
              openslider={open}
              startindex={pictureIndex}
            />
          </div>
          <div className="history__article__textarea">
            <h2 className="history__article__textarea__title">samedi 30 octobre 1869</h2>
            <h3>BULLETIN RELIGIEUX DU DIOCESE DE LA ROCHELLE SAINTES</h3>
            <h4>6° année</h4>
            <h5>Extrait.</h5>
            <p className="history__article__textarea__paragraph">
              … »(En) moins de trois ans, grâce à l’activité de M. le doyen de La Jarrie, et du
              concours de ses paroissiens, on a vu s’accomplir une restauration inespérée ;
              l’intérieur de l’église, jadis si délabré, a pris les proportions et l’élégance d’une
              nef gothique avec ses deux bas-côtés ; un sanctuaire de même ordre, accompagné de deux
              chapelles latérales ; a terminé chacune de ces nefs et un délicat autel, marbre et or
              ; est venu donner à cet ensemble un dernier trait de grâce et de bon goût.
            </p>
            <p className="history__article__textarea__paragraph">
              L’ornementation intérieure de l’édifice laissai encore à désirer, cependant, bien que
              le genre gothique soit déjà, et par lui-même, une ornementation.
            </p>
            <p className="history__article__textarea__paragraph">
              Le chemin de croix qui a été placé dimanche dernier, ne sera pas la moindre pièce de
              l’ornementation projetée. Les quatorze tableaux qui me composent, entourés chacun d’un
              encadrement (néo NDLR) gothique en chêne, découpé à jour, forment autour de l’église
              une galerie parfaitement harmonisée avec le genre et les proportions de l’édifice.
              Serons-nous indiscrets en disant que ces gracieux encadrements sont dus au travail
              habile et patient de M. le curé lui-même.
            </p>
            <p className="history__article__textarea__paragraph">
              La pose du chemin de croix été faite par M. L’abbé Birot, curé de Saint Nicolas,
              pendant que du haut de la chaire, M. l’abbé Rolland, ancien missionnaire du diocèse,
              appelait, avec un accent apostolique, l’attention des fidèles sur les grands souvenirs
              que redit à la foi du chrétien les stations de ce douloureux pèlerinage.
            </p>
            <p className="history__article__textarea__paragraph">
              L’ensemble de la cérémonie était d’un effet émouvant, et, nous en sommes persuadés,
              cette émotion laissera des traces dans l’âme des fidèles nombreux, présents à la
              cérémonie ».
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}

export default History;
