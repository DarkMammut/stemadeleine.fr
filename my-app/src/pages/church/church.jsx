import React from "react";
import { Helmet } from "react-helmet";
import Section from "../../components/section/section";
import "./church.scss";
import SectionsData from "../../assets/church.json";

function Church() {
  return (
    <main className="church">
      <Helmet>
        <title>ASSOCIATION | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <p className="church__paragraph">Hello</p>
      <Section Sections={SectionsData} />
    </main>
  );
}

export default Church;
