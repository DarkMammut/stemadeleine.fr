import React, { useEffect } from "react";
import { FaHandshake } from "react-icons/fa";
import { Link } from "react-router-dom";
import Article from "../../components/article/article";
import ArticleData from "../../assets/project.json";
import "./project.scss";

function Project() {
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <main id="project">
      <div className="container">
        <article>
          <Article Articles={ArticleData} />
          <div className="donation-progress">
            <h4>Dons collectés</h4>
            <div className="progress-bg">
              <div className="progress-bar">
                <h5 className="raised">10 000 €</h5>
              </div>

              <h5 className="goal">18 000 €</h5>
            </div>
            <Link
              to="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/3"
              target="_blank"
              className="btn--donate">
              Don pour le Chemin de Croix
              <FaHandshake className="icon" />
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

export default Project;
