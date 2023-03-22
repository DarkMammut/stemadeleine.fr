import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

function Join() {
  const pdf = "/join.pdf";
  const url = process.env.PUBLIC_URL + pdf;
  return (
    <main className="join">
      <Helmet>
        <title>Nous rejoindre | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <div>
        <Link to={url} target="_blank">
          Fiche d&apos;inscription
        </Link>
      </div>
    </main>
  );
}

export default Join;
