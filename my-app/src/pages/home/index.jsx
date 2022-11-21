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
      <section id="news" className="news">
        <h2 className="news_title">Actualités</h2>
      </section>
    </main>
  );
}

export default Home;
