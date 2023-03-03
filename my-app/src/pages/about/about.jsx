import React from "react";
import { Helmet } from "react-helmet";
import Section from "../../components/section/section";
import "./about.scss";
import SectionsData from "../../assets/about.json";

function About() {
  return (
    <main className="about">
      <Helmet>
        <title>Qui sommes nous ? | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <Section Sections={SectionsData} />
    </main>
  );
}

export default About;
