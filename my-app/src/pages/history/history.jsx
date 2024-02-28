import React, { useState, useEffect } from "react";
import ImageSlider from "../../components/slider/slider";
import SLIDES from "../../assets/slides.json";
import "./history.scss";

function History() {
  const url = process.env.PUBLIC_URL;
  const [open, setOpen] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  const handleInputChange = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (open === 1) {
      setOpen(0);
    }
  }, [open]);

  const handleKeyDown = (e) => {
    if (e.key === "Space") {
      setOpen(1);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClick = (slide) => {
    const index = SLIDES.history.findIndex((slides) => slides === slide);
    setSlideIndex(index);
    setOpen(1);
  };

  return (
    <main id="history">
      <div className="container">
        <div className="parent d-flex">
          <div className="input-container d-flex">
            <button
              className={activeIndex === 0 ? "input no-style-btn active" : "input no-style-btn"}
              type="button"
              onClick={() => handleInputChange(0)}
              aria-label="Button for year 1869">
              <span data-year="1869" />
            </button>
            <button
              className={activeIndex === 1 ? "input no-style-btn active" : "input no-style-btn"}
              type="button"
              onClick={() => handleInputChange(1)}
              aria-label="Button for year 1944">
              <span data-year="1944" />
            </button>
            <button
              className={activeIndex === 2 ? "input no-style-btn active" : "input no-style-btn"}
              type="button"
              onClick={() => handleInputChange(2)}
              aria-label="Button for year 2023">
              <span data-year="2023" />
            </button>
          </div>
          <div className="description-container d-flex">
            <article className={activeIndex === 0 ? "article active" : "article"}>
              <section className="section">
                <div className="section__textarea">
                  <div className="section__textarea__title d-flex justify-content-center">
                    <h2>30 octobre 1869</h2>
                    <h3>Extrait du bulletin religieux du diocèse de la Rochelle Saintes</h3>
                    <h4>6° année</h4>
                  </div>
                  <p className="section__textarea__paragraph">
                    … »(En) moins de trois ans, grâce à l’activité de M. le doyen de La Jarrie, et
                    du concours de ses paroissiens, on a vu s’accomplir une restauration inespérée ;
                    l’intérieur de l’église, jadis si délabré, a pris les proportions et l’élégance
                    d’une nef gothique avec ses deux bas-côtés ; un sanctuaire de même ordre,
                    accompagné de deux chapelles latérales ; a terminé chacune de ces nefs et un
                    délicat autel, marbre et or ; est venu donner à cet ensemble un dernier trait de
                    grâce et de bon goût.
                    <br />
                    L’ornementation intérieure de l’édifice laissai encore à désirer, cependant,
                    bien que le genre gothique soit déjà, et par lui-même, une ornementation.
                    <br />
                    Le chemin de croix qui a été placé dimanche dernier, ne sera pas la moindre
                    pièce de l’ornementation projetée. Les quatorze tableaux qui me composent,
                    entourés chacun d’un encadrement (néo NDLR) gothique en chêne, découpé à jour,
                    forment autour de l’église une galerie parfaitement harmonisée avec le genre et
                    les proportions de l’édifice. Serons-nous indiscrets en disant que ces gracieux
                    encadrements sont dus au travail habile et patient de M. le curé lui-même.
                    <br />
                    La pose du chemin de croix été faite par M. L’abbé Birot, curé de Saint Nicolas,
                    pendant que du haut de la chaire, M. l’abbé Rolland, ancien missionnaire du
                    diocèse, appelait, avec un accent apostolique, l’attention des fidèles sur les
                    grands souvenirs que redit à la foi du chrétien les stations de ce douloureux
                    pèlerinage.
                    <br />
                    L’ensemble de la cérémonie était d’un effet émouvant, et, nous en sommes
                    persuadés, cette émotion laissera des traces dans l’âme des fidèles nombreux,
                    présents à la cérémonie ».
                  </p>
                </div>
              </section>
            </article>
          </div>
          <div className="description-container d-flex">
            <article className={activeIndex === 1 ? "article active" : "article"}>
              <section className="section">
                <div className="section__textarea">
                  <div className="section__textarea__title d-flex justify-content-center">
                    <h2>Octobre 1944. Mai 1945.</h2>
                    <h3>Vœux et plaques votives</h3>
                  </div>
                  <div className="section__textarea__paragraph">
                    <p>
                      En 1944 la guerre n’est pas finie pour les aunisiens de La Jarrie, Croix
                      Chapeau et Salles sur Mer. Ces bourgs sont entourés de champs de mines, de
                      fossés antichars, à portée de canons aussi bien des Alliés que des Allemands
                      retranchés sur leur ligne de défense qui passe à La Jarne à hauteur du
                      carrefour Angoulins – Salles sur mer et se prolonge vers le Nord.
                    </p>
                    <br />
                    <p>
                      Sous l’incitation de leur curé respectif, l’abbé Bériau d’un côté et l’abbé
                      Tufferaud de l’autre, mais quelques années plus tard, les paroissiens vont
                      engager des actions différentes mais dans le même esprit : aux deux plaques du
                      vœu officiel d’octobre 1944 des habitants de Croix Chapeau et Salles sur Mer
                      correspond la souscription des trois cloches des paroissiens de La Jarrie dont
                      celle de la Reconnaissance « Je remercie Dieu d’avoir protégé La Jarrie » qui
                      du clocher-porche de l’église sainte Madeleine sonne, aujourd’hui comme hier,
                      à la volée.
                    </p>
                    <br />
                    <h4>
                      <b>LE VŒU EXAUCE</b>
                    </h4>
                    <br />
                    <span>Jean-Luc Dupas.</span>
                    <br />
                    <span>
                      Président de l’ASSOCIATION d’HISTOIRE et de GEOGRAPHIE en PAYS AUNISIEN.
                    </span>
                    <br />
                    <br />
                    <p>
                      Nous avons tous remarqué, dans <b>l’église de Croix-Chapeau</b>, la grande
                      plaque votive de marbre blanc qui orne le mur droit, près du crucifix.
                    </p>
                    <br />
                    <p>
                      Cette plaque a été posée en 1948 pour exaucer un vœu que
                      <b>l’abbé Bériau, curé de Salles-sur-mer et Croix-Chapeau</b> avait prononcé,
                      avec ses paroissiens, le <b>dimanche 29 octobre 1944</b>, lors de la fête du
                      Christ Roi.
                    </p>
                    <br />
                    <p>
                      « Si les deux paroisses étaient délivrées et libérées sans dommages, pour les
                      personnes et les biens, le vœu engageait tous les paroissiens, leur
                      descendance et leurs successeurs à perpétuité à célébrer, chaque année, dans
                      les deux paroisses, la fête du Vœu, jour de fête religieuse et chômée, avec
                      exposition et adoration du Saint-Sacrement durant toute la journée d’action de
                      grâce. Le vœu engageait également à ériger, dans l’église de chaque paroisse,
                      en ex-voto et par souscription paroissiale, une plaque de marbre relatant le
                      vœu. »
                    </p>
                    <br />
                    <p>
                      <b>Le curé Bériau</b> raconte que ce <b>29 octobre 1944</b>,
                      <i>
                        « la petite Maryvonne Boissard, offrant le pain bénit, s’avançait en tête de
                        l’offrande, du haut de ses quatre ans, avec son petit sac, gentille et
                        touchante, enfant prédestinée pour une plus grande offrande… »
                      </i>
                    </p>
                    <br />
                    <p>
                      Six mois plus tard, jour pour jour, le <b>29 avril 1945</b>, Maryvonne, lors
                      d’un bombardement, perd la vie dans les bras de son grand-père…
                    </p>
                    <br />
                    <p>
                      <b>Le curé Bériau</b>, dans son bulletin paroissial d&apos;<b>avril 1948</b>,
                      relate jour après jour, la dernière semaine d’occupation et de combats à
                      Croix-Chapeau et à Salles-sur-mer, du{" "}
                      <b>dimanche 29 avril 1945 au dimanche 6 mai 1945</b>, jour de la libération
                      des deux communes.
                    </p>
                    <br />
                    <p>
                      Dès <b>1946</b>, il lance une souscription pour l’achat d’une plaque de marbre
                      avec un devis de 36 439 francs, en y mettant, le premier, un billet de mille
                      francs.
                    </p>
                    <br />
                    <p>
                      Le curé Bériau pensait faire venir le père Riquet, célèbre prédicateur jésuite
                      de l’époque, ancien déporté, pour bénir ces plaques en 1946, mais il raconte
                      qu’il ne trouva pas de marbre dans la région, et qu’il fut obligé d’en faire
                      venir des Pyrénées à un prix bien supérieur à ce qu’il avait prévu, ce qui
                      retarda le projet. Le révérend père Riquet vient quand même du{" "}
                      <b>25 au 28 août 1946</b> et c’est un honneur pour la région, car il jouit
                      d’une réputation nationale. Une cérémonie a lieu à Salles/mer le 25 août, en
                      présence de toutes les personnalités de la région et il est reçu
                      officiellement à <b>Croix-Chapeau le 28 août 1946</b>. Le registre du Conseil
                      Municipal conserve un témoignage écrit de sa venue.
                    </p>
                    <br />
                    <p>
                      Les plaques de marbre sont posées en <b>1948</b> dans les deux églises de
                      <b>Croix-Chapeau</b> et de Salles-sur-mer et, depuis, chaque dernier dimanche
                      d’octobre, le secteur paroissial se réunit à Croix-Chapeau pour célébrer la
                      messe dans le respect du Vœu prononcé en octobre 1944.
                    </p>
                    <br />
                    <p>JL Dupas.</p>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
        <div className="gallery d-flex">
          {SLIDES.history.map((slide) => (
            <button
              key={slide.id}
              className="gallery__frame d-flex justify-content-center no-style-btn"
              onClick={() => handleClick(slide)}
              onKeyDown={handleKeyDown}
              type="button"
              tabIndex={0}>
              <img
                className="gallery__frame__picture"
                src={url + slide.url}
                alt={slide.alt}
                title={slide.title}
              />
            </button>
          ))}
        </div>
        <ImageSlider slidesImages={SLIDES.history} openSlider={open} startSlide={slideIndex} />
      </div>
    </main>
  );
}

export default History;
