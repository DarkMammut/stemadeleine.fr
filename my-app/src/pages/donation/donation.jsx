import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
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
          <h3>Le paiement est possible par :</h3>
          <span>1- carte bancaire en ligne sur la platforme HelloAsso :</span>
          <div className="buttons-container d-flex">
            <Link
              to="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/2"
              target="_blank"
              className="btn--donate">
              Don pour l&apos;association
              <FaPrint className="icon" />
            </Link>
            <Link
              to="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/3"
              target="_blank"
              className="btn--donate">
              Don pour le Chemin de Croix
              <FaPrint className="icon" />
            </Link>
          </div>
          <span>
            2- chèque ou espèces, en remplissant et en nous retournant le formulaire de don
            ci-dessous. :
          </span>
          <div className="buttons-container d-flex">
            <button
              className="btn--donate no-style-btn"
              type="button"
              onClick={() => navigate("/association/don/formulaire")}>
              Formulaire de don 2023
              <FaPrint className="icon" />
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}

export default Donation;
