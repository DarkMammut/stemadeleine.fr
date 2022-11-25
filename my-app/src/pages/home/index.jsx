import React from "react";
import { Helmet } from "react-helmet";
import "./index.scss";

document.title = "Accueil";

function Home() {
  return (
    <main>
      <Helmet>
        <title>ACCUEIL | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <section id="news" className="news">
        <h2 className="news_title">Actualités</h2>
      </section>
    </main>
  );
}

export default Home;
