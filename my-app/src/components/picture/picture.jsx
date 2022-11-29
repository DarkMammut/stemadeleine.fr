import React, { useState } from "react";

function ImageSlider({ slides }) {
  const url = process.env.PUBLIC_URL;
  const [open, setOpen] = useState(0);

  return (
    <div className="photos">
      <button className="photos__container" onClick={() => setOpen(1)} type="button">
        <div
          className="photos__container__background"
          style={{ backgroundImage: `url(${url}${slides[0]})` }}
        />
      </button>
      <slider open={open} />
    </div>
  );
}

export default ImageSlider;


