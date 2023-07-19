import React from "react";
import { Helmet } from "react-helmet";
import Article from "../../components/article/article";
import "./church.scss";
import ArticlesData from "../../assets/church.json";

function Church() {
  return (
    <main id="church">
      <Helmet>
        <title>ASSOCIATION | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <div className="container">
        {/* <p className="church__paragraph"></p> */}
        <Article Articles={ArticlesData} />
      </div>
    </main>
  );
}

export default Church;
