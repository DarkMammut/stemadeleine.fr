import React, { useEffect } from "react";
import Section from "../../components/section/section";
import "./about.scss";
import SectionsData from "../../assets/about.json";

function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <main id="about">
      <div className="container">
        <Section Sections={SectionsData} />
      </div>
    </main>
  );
}

export default About;
