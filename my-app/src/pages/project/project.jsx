import React from "react";
import { Helmet } from "react-helmet";
import Article from "../../components/article/article";
import ArticleData from "../../assets/project_articles.json";
import "./project.scss";

function Project() {
  return (
    <main>
      <Helmet>
        <title>PROJETS | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <section>
        <Article Articles={ArticleData} />
      </section>
    </main>
  );
}

export default Project;
