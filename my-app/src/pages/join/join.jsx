import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./join.scss";

function Join() {
  const pdf = "/join.pdf";
  const image = "/facade_clocher.jpeg";
  const url = process.env.PUBLIC_URL;
  return (
    <main id="join">
      <Helmet>
        <title>NOUS REJOINDRE | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <div className="container">
        <div className="join">
          <div className="join__image">
            <div className="join__image__title">
              <h2>Agissez pour le patrimoine</h2>
              <span>Devenez membre actif de l&apos;association</span>
            </div>
            <img src={url + image} title="Eglise de la Jarrie" alt="Eglise de la Jarrie" />
          </div>
          <div>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at turpis tincidunt,
              commodo ligula a, interdum eros. Proin dignissim ex a mauris tempus interdum. Etiam
              lobortis sollicitudin ultrices. Suspendisse ante nisl, mattis at arcu nec, dapibus
              suscipit ante. Proin risus sapien, aliquet in eleifend nec, gravida nec justo. Nam
              dapibus nunc turpis, in luctus tortor auctor nec. Etiam fermentum, lectus ac semper
              lobortis, lorem ipsum venenatis neque, nec posuere orci dui sed massa.
              <br />
              Nunc non malesuada erat. Vestibulum eu feugiat dolor. In tempus augue in nisi tempor
              facilisis. Mauris sed mi ipsum. Ut lorem ante, vulputate non nibh vitae, finibus
              aliquet dolor. Nunc mauris lorem, sagittis id magna at, sodales congue enim. Aliquam
              vel augue placerat, porta augue vitae, efficitur ligula. In condimentum at nunc a
              placerat. Suspendisse eget eros vel est ullamcorper condimentum. Praesent enim magna,
              consequat eget eros eget, egestas facilisis lacus. Sed vitae interdum nisi. Integer
              scelerisque, magna at faucibus scelerisque, diam diam convallis leo, scelerisque
              egestas magna neque eu tellus. Sed aliquet lectus non ipsum convallis, vel ultricies
              ante pellentesque. In aliquet ex et nibh vehicula pretium. Donec pulvinar nulla justo,
              ut vehicula eros sollicitudin vitae.
            </p>
            <Link to={url + pdf} target="_blank">
              Fiche d&apos;inscription
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Join;
