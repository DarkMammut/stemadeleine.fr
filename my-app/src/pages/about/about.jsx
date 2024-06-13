import React, { useEffect } from "react";
import Article from "../../components/article/article";
import "./about.scss";
import ArticlesData from "../../assets/about.json";

function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <main id="about">
      <div className="container">
        <Article Articles={ArticlesData} />
      </div>
    </main>
  );
}

export default About;
