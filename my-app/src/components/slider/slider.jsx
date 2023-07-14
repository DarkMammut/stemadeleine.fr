import React, { useState, useEffect } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slider.scss";

function ImageSlider({ slidesImages, openSlider, startIndex }) {
  const url = process.env.PUBLIC_URL;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appear, setAppear] = useState(0);

  useEffect(() => {
    if (openSlider === 1) {
      setCurrentIndex(currentIndex + startIndex);
      setAppear(1);
    }
  }, [openSlider]);

  function handleKeyDown(e) {
    switch (e.key) {
      case "escape":
        setAppear(0);
        break;

      default:
    }
  }
  function getPos(current, active) {
    const diff = current - active;

    if (Math.abs(current - active) > 2) {
      return -current;
    }

    return diff;
  }

  function update(newActive) {
    if (!newActive) {
      console.error("Invalid newActive element");
      return;
    }

    const newActivePos = newActive.dataset.pos;
    const current = document.querySelector('[data-pos="0"]');
    const prev = document.querySelector('[data-pos="-1"]');
    const next = document.querySelector('[data-pos="1"]');
    const first = document.querySelector('[data-pos="-2"]');
    const last = document.querySelector('[data-pos="2"]');

    if (current) {
      current.classList.remove("carousel__item_active");
    }

    [current, prev, next, first, last].forEach((item) => {
      const theItem = item;
      const itemPos = item.dataset.pos;
      const newPos = getPos(itemPos, newActivePos);
      theItem.dataset.pos = newPos;
    });
  }

  function show(e) {
    const newActive = e.target;
    const isItem = newActive.closest(".carousel__item");

    if (!isItem || newActive.classList.contains("carousel__item_active")) {
      return;
    }

    update(newActive);
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
        <ul className="slider__carousel__list">
          {slidesImages.map((slide) => (
            <li className="slider__carousel__item" key={slide.id}>
              <button type="button" className="no-style-btn fill-content" onClick={show}>
                <img
                  className="slider__carousel__item__image"
                  src={url + slide.url}
                  title={slide.title}
                  alt={slide.alt}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ImageSlider;
