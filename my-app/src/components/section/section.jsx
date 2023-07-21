import React from "react";
import parse from "html-react-parser";
import "./section.scss";

function Section({ Sections }) {
  const url = process.env.PUBLIC_URL;

  return Sections.map((section) => {
    if (section.display === "enable") {
      return (
        <section className="section" id={section.id} key={section.id}>
          <div className="section__textarea" data-images={section.images.length > 0 ? "1" : "0"}>
            <h3 className="section__textarea__title">{section.title}</h3>
            {section.text?.map((ph) => (
              <div key={ph.id} className="section__textarea__paragraph">
                {parse(ph.paragraph)}
              </div>
            ))}
          </div>
          {section.images.length > 0 ? (
            <div className="section__images">
              {section.images.map((image) => (
                <div className="section__images__frame" id={image.id} key={image.id}>
                  <div className="section__images__frame__image">
                    <img src={url + image.url} title={image.title} alt={image.alt} />
                  </div>
                  <span>{image.title}</span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      );
    }
    return null;
  });
}

export default Section;
