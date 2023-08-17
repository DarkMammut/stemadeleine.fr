import React from "react";
import { useNavigate } from "react-router-dom";
import "./donation.scss";

function Donation() {
  const navigate = useNavigate();

  const handleClickNavigate = () => {
    navigate("/association/don/formulaire"); // Navigates to the "formulaire" route
  };

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
          <button
            className="btn btn--navigate no-style-btn"
            type="button"
            onClick={handleClickNavigate}>
            formulaire à imprimer
          </button>
          <iframe
            id="haWidget"
            title="HelloAsso Widget"
            src="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/1/widget-bouton"
            style={{ width: "100%", height: "70px", border: "none" }}
          />
        </article>
      </div>
    </main>
  );
}

export default Donation;
