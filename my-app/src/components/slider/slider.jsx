import React, { useState, useEffect } from "react";
import "./slider.scss";

function ImageSlider({ slides, openslider, startindex }) {
  const url = process.env.PUBLIC_URL;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shut, setShut] = useState(0);
  const { length } = slides;

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? length - 1 : currentIndex - 1);
  };

  const nextSlide = () => {
    setCurrentIndex(currentIndex === length - 1 ? 0 : currentIndex + 1);
  };

  useEffect(() => {
    if (openslider === 1) {
      setShut(1);
      setCurrentIndex(startindex);
    }
  }, [openslider]);

  function handleKeyDown(e) {
    if (e.key === "escape") {
      setShut(0);
    }
  }

  return (
    <div className="slider" data-open={shut}>
      <button
        className="slider__shut"
        aria-label="shut"
        onClick={() => setShut(0)}
        onKeyDown={handleKeyDown}
        type="button">
        <div className="slider__shut__line" />
        <div className="slider__shut__line" />
      </button>
      <button
        className="slider__backgroung"
        aria-label="shut"
        onClick={() => setShut(0)}
        onKeyDown={handleKeyDown}
        type="button"
      />
      <div
        className="slider__current"
        style={{ backgroundImage: `url(${url}${slides[currentIndex]})` }}>
        <button className="slider__current__left" onClick={prevSlide} type="button">
          <svg viewBox="0 0 48 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M47.04 7.78312L39.92 0.703125L0.359985 40.3031L39.96 79.9031L47.04 72.8231L14.52 40.3031L47.04 7.78312Z"
              fill="white"
            />
          </svg>
        </button>

        <button className="slider__current__right" onClick={nextSlide} type="button">
          <svg viewBox="0 0 48 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0.960022 72.3458L8.04002 79.4258L47.64 39.8258L8.04002 0.22583L0.960022 7.30583L33.48 39.8258L0.960022 72.3458Z"
              fill="white"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ImageSlider;
