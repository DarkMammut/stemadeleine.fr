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
  const path = location.pathname;
  const mainUrl = reduceUrl(path);
  const end = " | Les Amis de Sainte Madeleine de La Jarrie";
  let found = "";

  if (path === mainUrl || mainUrl === "/newsletter" || mainUrl === "/don") {
    found = Data.find((helmet) => helmet.path === mainUrl);
  } else {
    const mainObject = Data.find((object) => object.path === mainUrl);
    if (!mainObject) {
      found = Data.find((helmet) => helmet.id === "Error-404");
    } else {
      found = mainObject.sublinks.find((helmet) => mainUrl + helmet.path === path);
    }
  }

  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{found.name + end}</title>
      <meta name="description" content={found.description} />
    </Helmet>
  );
}

export default Meta;
