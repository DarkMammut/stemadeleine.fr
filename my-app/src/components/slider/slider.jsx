import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slider.scss";

function ImageSlider({ slidesImages, openslider, startindex }) {
  const url = process.env.PUBLIC_URL;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appear, setAppear] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    fade: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 15000,
    centerMode: true,
    centerPadding: 0
  };

  useEffect(() => {
    if (openslider === 1) {
      setCurrentIndex(currentIndex + startindex);
      setAppear(1);
    }
  }, [openslider]);

  function handleKeyDown(e) {
    switch (e.key) {
      case "escape":
        setAppear(0);
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
      <div className="slider__carousel">
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Slider {...settings}>
          {slidesImages.map((slide) => (
            <div className="slider__carousel__slide" key={slide.id}>
              <img
                className="slider__carousel__slide__image"
                src={url + slide.url}
                title={slide.title}
                alt={slide.alt}
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default ImageSlider;
