import React from "react";
import { Helmet } from "react-helmet";
import Article from "../../components/article/article";
import "./about.scss";
import ArticlesData from "../../assets/about.json";

function About() {
  return (
    <main id="about">
      <Helmet>
        <title>Qui sommes nous ? | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <div className="container">
        <Article Articles={ArticlesData} />
      </div>
    </main>
  );
}

export default About;
