import React from "react";
import { Helmet } from "react-helmet";
import Section from "../../components/section/section";
import "./bells.scss";
import SectionsData from "../../assets/bells.json";

document.title = "Les cloches";

function Bells() {
  return (
    <main id="bells">
      <Helmet>
        <title>CLOCHES | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <p className="bells__paragraph">
        On atteint la salle des cloches de l’imposant clocher-porche du XIIe siècle en empruntant un
        escalier à vis. Cette salle abrite les 4 cloches de la Jarrie. Ce jeu est le plus gros
        pleinium de l’Aunis, et justifie qu’après quatorze ans de silence la municipalité ait offert
        aux Jarriens la joie d’entendre à nouveau son patrimoins campanaire.
      </p>
      <Section Sections={SectionsData} />
    </main>
  );
}

export default Bells;
