import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./donation.scss";

function Donation() {
  const navigate = useNavigate();

  return (
    <main id="donation">
      <div className="container">
        <article>
          <h2>Devenez Membre Bienfaiteur de l&apos;Association</h2>
          <p>
            En soutenant notre association, vous contribuez à agir pour la sauvegarde et la
            valorisation de l&apos;église de La Jarrie.
            <br />
            Les dons ouvrent droit à une réduction d&apos;impôt pour les personnes domiciliées en
            France à hauteur de 66% dans la limite de 20% de votre revenu imposable.
          </p>
          <div className="buttons-container d-flex">
            <button
              className="btn btn--navigate no-style-btn"
              type="button"
              onClick={() => navigate("/association/don/formulaire")}>
              formulaire à imprimer
            </button>
            <Link
              to="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/2"
              target="_blank"
              className="btn btn--navigate no-style-btn">
              Je donne en ligne
            </Link>
            <Link
              to="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/3"
              target="_blank"
              className="btn btn--navigate no-style-btn">
              Je donne pour le Chemin de Croix
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

export default Donation;
