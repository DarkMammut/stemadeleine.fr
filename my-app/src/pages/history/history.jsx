import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import ImageSlider from "../../components/slider/slider";
import SLIDES from "../../assets/slides.json";
import "./history.scss";

function History() {
  const [open, setOpen] = useState(0);
  const url = process.env.PUBLIC_URL;
  const pictureIndex = 0;

  useEffect(() => {
    if (open === 1) {
      setOpen(0);
    }
  }, [open]);

  return (
    <main>
      <Helmet>
        <title>HISTOIRE | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>
      <section className="history">
        <article className="history__article">
          <div className="history__article__image">
            <button
              className="history__article__image__container"
              onClick={() => setOpen(1)}
              type="button">
              <div
                className="history__article__image__container__background"
                style={{ backgroundImage: `url(${url}${SLIDES.history[pictureIndex]})` }}
              />
            </button>
            <ImageSlider slides={SLIDES.history} openslider={open} startindex={pictureIndex} />
          </div>
          <div className="history__article__textarea">
            <h2 className="history__article__textarea__title">Titre</h2>
            <p className="history__article__textarea__paragraph">
              Lorem ipsum dolor sit amet. Ut libero alias sit error nulla et dicta dolore. Aut harum
              consequatur ea quos galisum est delectus dolores et facilis culpa sit quia enim vel
              ducimus voluptatem et temporibus nesciunt. Qui iste laboriosam ex amet provident ut
              quia officia et ducimus veniam in eligendi debitis non odio voluptatem ut natus
              explicabo. Quo repudiandae quis et architecto distinctio aut dolor consequatur non
              nihil internos et quas corrupti. Aut asperiores cumque cum vero unde sit impedit
              eligendi vel doloribus nihil. Qui aliquam magni ea suscipit corporis aut autem quidem!
              A dignissimos excepturi aut aliquid placeat sed explicabo facilis vel ipsa aliquam qui
              quibusdam galisum ut culpa dolores? Eos voluptas voluptatem est magni repellat 33
              autem dolores 33 temporibus placeat ut deserunt omnis qui fuga commodi a quisquam
              commodi. Nam nisi asperiores id consectetur possimus aut debitis autem ea eius sint
              est amet sint ut autem nobis ut officia ipsum? Id voluptas consequuntur ut tenetur
              temporibus rem adipisci nostrum sed voluptas sint vel sapiente nulla aut beatae
              voluptate qui enim voluptas. Non nihil explicabo et consequatur sunt eos modi quae. Et
              velit natus est recusandae minus in saepe voluptas. Non error aliquam vel illum
              pariatur non provident ullam vel vitae fuga sit neque expedita non voluptatem dolore.
              At delectus tempora eos autem temporibus qui nulla nihil id consectetur fugit ut vero
              facere.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}

export default History;
