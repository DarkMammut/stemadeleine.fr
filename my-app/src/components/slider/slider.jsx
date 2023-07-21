import React, { useState, useEffect } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import "./slider.scss";

function ImageSlider({ slidesImages, openSlider, startSlide }) {
  const url = process.env.PUBLIC_URL;
  const [appear, setAppear] = useState(0);
  const [sliderData, setSliderData] = useState(slidesImages[0]);

  const handleClick = (index) => {
    const slider = slidesImages[index];
    setSliderData(slider);
  };

  useEffect(() => {
    if (openSlider === 1) {
      setAppear(1);
      const slider = slidesImages[startSlide];
      setSliderData(slider);
    }
  }, [openSlider]);

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      handleClick(index);
    } else if (e.key === "Escape") {
      setAppear(0);
    }
  };

  const next = () => {
    let nextIndex = 0;
    const currentIndex = slidesImages.findIndex((slide) => slide === sliderData);
    if (currentIndex === slidesImages.length - 1) {
      nextIndex = 0;
    } else {
      nextIndex = currentIndex + 1;
    }
    const nextSlide = slidesImages[nextIndex];
    setSliderData(nextSlide);
  };

  const previous = () => {
    let previousIndex = 0;
    const currentIndex = slidesImages.findIndex((slide) => slide === sliderData);
    if (currentIndex === 0) {
      previousIndex = slidesImages.length - 1;
    } else {
      previousIndex = currentIndex - 1;
    }
    const previousSlide = slidesImages[previousIndex];
    setSliderData(previousSlide);
  };

  return (
    <div className="slider d-flex" data-open={appear}>
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
      <div className="slider__container">
        <button
          className="slider__container__btn slider__container__btn--next no-style-btn d-flex"
          type="button"
          onKeyDown={handleKeyDown}
          onClick={next}>
          <FaChevronRight className="slider__container__btn__chevrons" />
        </button>
        <button
          className="slider__container__btn slider__container__btn--previous no-style-btn d-flex"
          type="button"
          onKeyDown={handleKeyDown}
          onClick={previous}>
          <FaChevronLeft className="slider__container__btn__chevrons" />
        </button>
        <img
          className="slider__container__activeslide"
          src={url + sliderData.url}
          alt={sliderData.alt}
        />
      </div>
      <ScrollContainer className="slider__thumbnails d-flex">
        {slidesImages.map((image, i) => (
          <div className="slider__thumbnails__thumbnail" key={image.id}>
            <button
              className={sliderData.id === image.id ? "clicked no-style-btn" : "no-style-btn"}
              type="button"
              onKeyDown={() => handleKeyDown(i)}
              onClick={() => handleClick(i)}>
              <img src={url + image.url} alt={image.alt} />
            </button>
          </div>
        ))}
      </ScrollContainer>
    </div>
  );
}

export default ImageSlider;
