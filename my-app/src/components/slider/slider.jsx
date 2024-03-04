import React, { useState, useEffect } from "react";
import Slider from "react-touch-drag-slider";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import "./slider.scss";

function ImageSlider({ slidesImages, openSlider, startSlide }) {
  const publicUrl = process.env.PUBLIC_URL;
  const [appear, setAppear] = useState(0);
  const [index, setIndex] = useState(0);

  const setFinishedIndex = (i) => {
    setIndex(i);
  };

  useEffect(() => {
    if (openSlider === 1) {
      setAppear(1);
      setIndex(startSlide);
    }
  }, [openSlider]);

  const handleNext = () => {
    if (index < slidesImages.length - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  };

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    } else {
      setIndex(slidesImages.length - 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setAppear(0);
    } else if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  return (
    <div className="slider" data-open={appear}>
      <button
        className="slider__shut"
        aria-label="shut"
        onClick={() => setAppear(0)}
        onKeyDown={handleKeyDown}
        type="button">
        <div className="slider__shut__line" />
        <div className="slider__shut__line" />
      </button>
      <div className="slider__backgroung" />
      <div className="slider__container d-flex justify-content-center">
        <button
          className="slider__container__btn slider__container__btn--next no-style-btn d-flex"
          type="button"
          onKeyDown={handleKeyDown}
          onClick={handleNext}
          aria-label="button to go to the next slide">
          <FaChevronRight className="slider__container__btn__chevrons" />
        </button>
        <button
          className="slider__container__btn slider__container__btn--previous no-style-btn d-flex"
          type="button"
          onKeyDown={handleKeyDown}
          onClick={handlePrevious}
          aria-label="button to go to the previous slide">
          <FaChevronLeft className="slider__container__btn__chevrons" />
        </button>
        <div className="slider__container__frame">
          <Slider
            onSlideComplete={setFinishedIndex}
            activeIndex={index}
            threshHold={100}
            transition={0.2}
            scaleOnDrag>
            {slidesImages.map(({ id, url, alt }) => (
              <img src={publicUrl + url} key={id} alt={alt} />
            ))}
          </Slider>
        </div>
        <ul className="slider__container__dots d-flex justify-content-center">
          {slidesImages.map(({ id, url }, i) => (
            <li
              className={
                i === index ? "slider__container__dots__dot active" : "slider__container__dots__dot"
              }
              key={id}>
              <button
                className="slider__container__dots__dot__btn no-style-btn"
                type="button"
                onClick={() => setIndex(i)}
                aria-label="button to go to the selected slide"
                style={{
                  backgroundImage: `url(${publicUrl}${url})`
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ImageSlider;
