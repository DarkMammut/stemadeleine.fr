import React from "react";
import { Helmet } from "react-helmet";
import Banner from "../../components/banner/banner";

function About() {
  return (
    <main>
      <Helmet>
        <title>Qui sommes nous ? | Les amis de Sainte Madeleine de la Jarrie</title>
      </Helmet>
      <Banner />
      <div>hello</div>
    </main>
  );
}

export default About;
