import React, { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";

function Contact() {
  const captchaRef = useRef(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // const validEmailRegex = RegExp(
  //   /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  // );

  const verifyToken = async (token) => {
    try {
      const response = await axios.post(
        `http://localhost:4000/verify-token`,
        {
          secret: process.env.REACT_APP_SECRET_KEY,
          token
        },
        console.log(token)
      );
      return response.data;
    } catch (error) {
      console.log("error ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (firstName && lastName) {
      const token = captchaRef.current.getValue();
      if (token) {
        const validToken = await verifyToken(token);
        if (validToken.success) {
          setMessage("Hurray!! you have submitted the form");
        } else {
          setError("Sorry!! Token invalid");
        }
      } else {
        setError("You must confirm you are not a robot");
      }
    } else {
      setError("First name and Last name are required");
    }
  };

  return (
    <main id="contact">
      <Helmet>
        <title>CONTACT | Les Amis de Sainte Madeleine de La Jarrie</title>
      </Helmet>

      <div className="form">
        {error && <p className="textError">Error!! {error}</p>}
        {message && <p className="textSuccess">Success!! {message}</p>}
        <form onSubmit={handleSubmit} className="formContainer">
          <div className="formGroup">
            <label htmlFor="firstName">Prénom</label>
            <input
              type="text"
              name="first_name"
              placeholder="Entrer votre prénom"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="formGroup">
            <label htmlFor="lastName">Nom</label>
            <input
              type="text"
              name="last_name"
              placeholder="Entrer votre nom"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="formGroup">
            <ReCAPTCHA sitekey={process.env.REACT_APP_SITE_KEY} ref={captchaRef} />
          </div>
          <div className="formGroup">
            <button type="submit">Envoyer</button>
          </div>
        </form>
      </div>

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
