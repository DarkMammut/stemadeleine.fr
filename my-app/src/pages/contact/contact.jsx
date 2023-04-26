import React from "react";
import { Helmet } from "react-helmet";

function Contact() {
  return (
    <main id="contact">
      <Helmet>
        <title>CONTACT | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>

      <form name="contact" method="post">
        <input type="hidden" name="form-name" value="contact" />
        <p>
          <label>
            Prénom: <input type="text" name="firstname" />
          </label>
        </p>
        <p>
          <label>
            Nom: <input type="text" name="lastname" />
          </label>
        </p>
        <p>
          <label>
            Email: <input type="email" name="email" />
          </label>
        </p>
        <p>
          <label>
            Message: <textarea name="message" />
          </label>
        </p>
        <p>
          <button type="submit">Envoyer</button>
        </p>
      </form>

      <iframe
        title="map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2765.04729886033!2d-1.0134871825561522!3d46.129887700000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48014be2c51280a9%3A0x4e96103d6c8f2a26!2sEglise%20de%20La%20Jarrie!5e0!3m2!1sfr!2sfr!4v1669420241164!5m2!1sfr!2sfr"
        width="600"
        height="450"
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </main>
  );
}

export default Contact;
