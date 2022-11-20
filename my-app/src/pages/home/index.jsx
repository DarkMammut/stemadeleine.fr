import React from "react";
import { Helmet } from "react-helmet";
import "./index.scss";
import Banner from "../../components/banner/banner";

function Home() {
  return (
    <main>
      <Helmet>
        <title>ACCUEIL | Les amis de Sainte Madeleine de la Jarrie</title>
      </Helmet>
      <Banner />
    </main>
  );
}

export default Home;
