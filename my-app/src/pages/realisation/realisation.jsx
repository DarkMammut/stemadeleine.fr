import React from "react";
import { Helmet } from "react-helmet";
import Article from "../../components/article/article";
import ArticleData from "../../assets/realisations.json";
import "./realisation.scss";

function Realisation() {
  return (
    <main className="realisations">
      <Helmet>
        <title>ASSOCIATION | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <section>
        <Article Articles={ArticleData} />
      </section>
    </main>
  );
}

export default Realisation;
