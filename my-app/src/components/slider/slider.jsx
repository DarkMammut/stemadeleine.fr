import React, { useState, useEffect } from "react";
import "./slider.scss";

function ImageSlider({ slides, openslider, startindex }) {
  const url = process.env.PUBLIC_URL;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appear, setAppear] = useState(0);
  const { length } = slides;

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? length - 1 : currentIndex - 1);
  };

  const nextSlide = () => {
    setCurrentIndex(currentIndex === length - 1 ? 0 : currentIndex + 1);
  };

  useEffect(() => {
    if (openslider === 1) {
      setAppear(1);
      setCurrentIndex(startindex);
    }
  }, [openslider]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex(currentIndex === length - 1 ? 0 : currentIndex + 1);
    }, 30000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  function handleKeyDown(e) {
    switch (e.key) {
      case "escape":
        setAppear(0);
        break;

      case "spaceArrowRight":
        setCurrentIndex(currentIndex === length - 1 ? 0 : currentIndex + 1);
        break;

      case "spaceArrowLeft":
        setCurrentIndex(currentIndex === 0 ? length - 1 : currentIndex - 1);
        break;

      default:
    }
  }

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
      <button
        className="slider__backgroung"
        aria-label="shut"
        onClick={() => setAppear(0)}
        onKeyDown={handleKeyDown}
        type="button"
      />
      <div className="slider__current">
        {slides.map((slide, index) => (
          <div
            className="slider__current__slide"
            key={slide.id}
            style={{ marginLeft: index === 0 ? `-${currentIndex * 100}%` : undefined }}>
            <img
              className="slider__current__slide__image"
              src={url + slide.url}
              title={slide.title}
              alt={slide.alt}
            />
          </div>
        ))}
        <div className="slider__current__indicator">
          {slides.map((slide, index) => (
            <button
              className="slider__current__indicator__dot"
              key={slide.id}
              aria-label="go to slide"
              type="button"
              onClick={() => setCurrentIndex(index)}
              onKeyDown={handleKeyDown}
              style={{ opacity: currentIndex === index ? 1 : 0.5 }}
            />
          ))}
        </div>
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
