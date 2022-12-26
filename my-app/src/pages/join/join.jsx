import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import pdf from "../../assets/join.pdf";

function Join() {
  return (
    <main>
      <Helmet>
        <title>Nous rejoindre | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <div>
        <Link to={pdf} target="_blank">
          Fiche d&apos;inscription
        </Link>
      </div>
    </main>
  );
}

export default Join;
