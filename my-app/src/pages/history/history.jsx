import React from "react";
import { Helmet } from "react-helmet";
import ImageSlider from "../../components/slider/slider";
import SLIDES from "../../assets/slides.json";

function History() {
  return (
    <main>
      <Helmet>
        <title>HISTOIRE | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <ImageSlider slides={SLIDES.history} />
      <div>hello</div>
    </main>
  );
}

export default History;
