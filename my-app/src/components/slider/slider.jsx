import React, { useState } from "react";
import "./slider.scss";

function ImageSlider({ slides }) {
  const url = process.env.PUBLIC_URL;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(0);
  const { length } = slides;

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? length - 1 : currentIndex - 1);
  };

  const nextSlide = () => {
    setCurrentIndex(currentIndex === length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="photos">
      <button className="photos__container" onClick={() => setOpen(1)} type="button">
        <div
          className="photos__container__background"
          style={{ backgroundImage: `url(${url}${slides[0]})` }}
        />
      </button>
      <div className="photos__slider" data-open={open}>
        <button className="photos__slider__shut" onClick={() => setOpen(0)} type="button">
          <div className="photos__slider__shut__line" />
          <div className="photos__slider__shut__line" />
        </button>
        <div
          className="photos__slider__current"
          style={{ backgroundImage: `url(${url}${slides[currentIndex]})` }}>
          <button className="photos__slider__current__left" onClick={prevSlide} type="button">
            <svg viewBox="0 0 48 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M47.04 7.78312L39.92 0.703125L0.359985 40.3031L39.96 79.9031L47.04 72.8231L14.52 40.3031L47.04 7.78312Z"
                fill="white"
              />
            </svg>
          </button>

          <button className="photos__slider__current__right" onClick={nextSlide} type="button">
            <svg viewBox="0 0 48 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0.960022 72.3458L8.04002 79.4258L47.64 39.8258L8.04002 0.22583L0.960022 7.30583L33.48 39.8258L0.960022 72.3458Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageSlider;
