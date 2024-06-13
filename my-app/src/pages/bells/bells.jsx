import React, { useEffect } from "react";
import Article from "../../components/article/article";
import "./bells.scss";
import ArticlesData from "../../assets/bells.json";

document.title = "Les cloches";

function Bells() {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <main id="bells">
      <div className="container">
        <p className="bells__paragraph">
          On atteint la salle des cloches de l’imposant clocher-porche du XIIe siècle en empruntant
          un escalier à vis. Cette salle abrite les 4 cloches de la Jarrie. Ce jeu est le plus gros
          pleinium de l’Aunis, et justifie qu’après quatorze ans de silence la municipalité ait
          offert aux Jarriens la joie d’entendre à nouveau son patrimoins campanaire.
        </p>
        <Article Articles={ArticlesData} />
      </div>
    </main>
  );
}

export default Bells;
