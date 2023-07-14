import React, { useState, useEffect } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slider.scss";

function ImageSlider({ slidesImages, openSlider, startIndex }) {
  const url = process.env.PUBLIC_URL;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appear, setAppear] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<ImageType>();
  const carouselItemsRef = useRef<HTMLDivElement[] | null[]>([]);

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

  useEffect(() => {
    if (slidesImages && slidesImages[0]) {
      carouselItemsRef.current = carouselItemsRef.current.slice(
        0,
        slidesImages.length
      );

      setSelectedImageIndex(0);
      setSelectedImage(slidesImages[0]);
    }
  }, [slidesImages]);

  const handleSelectedImageChange = (newIdx: number) => {
    if (slidesImages && slidesImages.length > 0) {
      setSelectedImage(slidesImages[newIdx]);
      setSelectedImageIndex(newIdx);
      if (carouselItemsRef?.current[newIdx]) {
        carouselItemsRef?.current[newIdx]?.scrollIntoView({
          inline: "center",
          behavior: "smooth"
        });
      }
    }
  };

  const handleRightClick = () => {
    if (slidesImages && slidesImages.length > 0) {
      let newIdx = selectedImageIndex + 1;
      if (newIdx >= slidesImages.length) {
        newIdx = 0;
      }
      handleSelectedImageChange(newIdx);
    }
  };

  const handleLeftClick = () => {
    if (slidesImages && slidesImages.length > 0) {
      let newIdx = selectedImageIndex - 1;
      if (newIdx < 0) {
        newIdx = slidesImages.length - 1;
      }
      handleSelectedImageChange(newIdx);
    }
  };

  return (
    <div className="carousel-container">
      <h2 className="header">Image Carousel</h2>
      <div
        className="selected-image"
        style={{ backgroundImage: `url(${url}${selectedImage?.url})` }}
      />
      <div className="carousel">
        <div className="carousel__images">
          {slidesImages &&
            slidesImages.map((image, idx) => (
              <div
                onClick={() => handleSelectedImageChange(idx)}
                style={{ backgroundImage: `url(${url}${image.url})` }}
                key={image.id}
                className={`carousel__image ${
                  selectedImageIndex === idx && "carousel__image-selected"
                }`}
                ref={(el) => (carouselItemsRef.current[idx] = el)}
              />
            ))}
        </div>
        <button
          className="carousel__button carousel__button-left"
          onClick={handleLeftClick}
        >
          Prev
        </button>
        <button
          className="carousel__button carousel__button-right"
          onClick={handleRightClick}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ImageSlider;
