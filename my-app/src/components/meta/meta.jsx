import React from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import helmetArray from "../../assets/helmet.json";

function Meta() {
  const location = useLocation();
  const index = helmetArray.findIndex((object) => object.location === location.pathname);
  let path = location.pathname;

  if (index === -1) {
    path = "/newsletter/:id";
  }

  const found = helmetArray.find((helmet) => helmet.location === path);

  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{found.title}</title>
      <meta name="description" content={found.description} />
    </Helmet>
  );
}

export default Meta;
