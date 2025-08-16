import React from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import Data from "../../assets/header.json";

function reduceUrl(url) {
  const dernierSlashIndex = url.lastIndexOf("/");
  if (dernierSlashIndex > 0) {
    return url.substring(0, dernierSlashIndex);
  }
  return url;
}

function Meta() {
  const location = useLocation();
  let path = location.pathname;
  let reducedPath = reduceUrl(path);
  const end = " | Les Amis de Sainte Madeleine de La Jarrie";
  let found = "";

  if (path === reducedPath || reducedPath === "/nos-actions") {
    found = Data.find((helmet) => helmet.path === reducedPath);

    if (!found) {
      found = Data.find((helmet) => helmet.id === "Error-404");
    }
  } else {
    if (path === "/association/don/formulaire" || reducedPath === "/association/newsletter") {
      path = reducedPath;
      reducedPath = "/association";
    }
    const mainObject = Data.find((object) => object.path === reducedPath);
    const subLink = mainObject.sublinks.find((helmet) => reducedPath + helmet.path === path);

    if (!mainObject || !subLink) {
      found = Data.find((helmet) => helmet.id === "Error-404");
    } else {
      found = mainObject.sublinks.find((helmet) => reducedPath + helmet.path === path);
    }
  }

  return (
    <Helmet>
      <title>{found.name + end}</title>
      <meta name="description" content={found.description} />
    </Helmet>
  );
}

export default Meta;
