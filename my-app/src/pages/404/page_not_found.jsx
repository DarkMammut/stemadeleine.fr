import React from "react";
import { Link } from "react-router-dom";
import "./page_not_found.scss";

function PageNotFound() {
  return (
    <main className="page">
      <div id="page__background" />
      <div className="page__top">
        <h1 className="page__top__title">404</h1>
        <h3 className="page__top__subhead">page non trouvée</h3>
      </div>
      <div className="page__container">
        <div className="page__container__ghost">
          <div className="page__container__ghost__hands">
            <div className="page__container__ghost__hands--left" />
            <div className="page__container__ghost__hands--right" />
          </div>
          <div className="page__container__ghost__face">
            <div className="page__container__ghost__eyes">
              <div className="page__container__ghost__eyes--left" />
              <div className="page__container__ghost__eyes--right" />
            </div>
            <div className="page__container__ghost__mouth" />
            <div className="page__container__ghost__feet">
              <div className="page__container__ghost__feet--one" />
              <div className="page__container__ghost__feet--two" />
              <div className="page__container__ghost__feet--three" />
              <div className="page__container__ghost__feet--four" />
            </div>
          </div>
        </div>
        <div className="page__container__shadow" />
      </div>
      <div className="page__bottom">
        <p className="page__bottom__text">
          Boo, il semblerait que la page cherchée est introuvable !
        </p>
        <Link to="/" className="page__bottom__home">
          Retourner à la page d&apos;accueil
        </Link>
      </div>
    </main>
  );
}

export default PageNotFound;
