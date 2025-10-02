import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import Article from "../article/article";
import ImageSlider from "../slider/slider";
import "./section.scss";

function Section({ Sections }) {
  const url = process.env.PUBLIC_URL;
  const [open, setOpen] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeSection, setActiveSection] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (open === 1) {
      setOpen(0);
    }
  }, [open]);

  const handleClick = (slide, active) => {
    const index = active.images.findIndex((slides) => slides === slide);
    setActiveSection(active);
    setSlideIndex(index);
    setOpen(1);
  };

  const handleClickNavigate = (link) => {
    const currentPath = location.pathname.split("/")[1]; // Récupère la section principale de l'URL
    navigate(`/${currentPath}/${link}`);
  };

  return (
    <div>
      {Sections.map((section) => (
        <section key={section.id} className="section" id={section.id}>
          <h2 className="section__title">{section.title}</h2>
          <div className="section__container">
            <div className="section__textarea" data-images={section.images.length > 0 ? "1" : "0"}>
              {section.text.length > 0 ? (
                <div className="section__textarea__text">
                  {section.text.map((sectionText) => (
                    <div key={sectionText.id} className="section__textarea__text__paragraph">
                      {parse(sectionText.paragraph)}
                    </div>
                  ))}
                </div>
              ) : null}
              {section.button === "enable" ? (
                <div className="article__textarea__button">
                  <button
                    className="btn btn--navigate no-style-btn"
                    type="button"
                    onClick={() => handleClickNavigate(section.link)}>
                    Suite =&gt;
                  </button>
                </div>
              ) : null}
              <div className="section__textarea__articles">
                {section.article.length > 0 ? <Article Articles={section.article} /> : null}
              </div>
            </div>
            {section.images.length > 0 ? (
              <div className="section__images">
                {section.images.map((image) => (
                  <button
                    className="section__images__frame no-style-btn"
                    id={image.id}
                    key={image.id}
                    type="button"
                    onClick={() => {
                      handleClick(image, section);
                    }}>
                    <div className="section__images__frame__image">
                      <img src={url + image.url} title={image.title} alt={image.alt} />
                    </div>
                    <span>{image.title}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ))}
      {Object.keys(activeSection).length > 0 ? (
        <ImageSlider
          slidesImages={activeSection.images}
          openSlider={open}
          startSlide={slideIndex}
        />
      ) : null}
    </div>
  );
}

export default Section;
