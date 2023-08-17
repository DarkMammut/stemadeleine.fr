import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./donationform.scss";

function DonationForm() {
  const [state, setState] = useState({});
  const url = `${process.env.PUBLIC_URL}/logo.png`;
  const style = { backgroundImage: `url(${url})` };

  const handleCheckboxChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.checked });
  };

  const handleChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print(); // Appel de la fonction d'impression du navigateur
  };

  return (
    <main id="donationform">
      <div className="container">
        <div className="form-container d-flex">
          <div className="frame d-flex">
            <Link to="/">
              <div className="frame__logo" style={style} />
            </Link>
            <h1>
              FORMULAIRE DE DON
              <br />
              {new Date().getFullYear()}
            </h1>
            <h2>Les Amis de Sainte Madeleine de La Jarrie</h2>
            <div className="frame__columns d-flex">
              <div className="frame__columns__contact">
                <div className="frame__columns__contact__row">
                  <span>Adresse :</span>
                  <p>
                    Les Amis de Sainte Madeleine de La Jarrie
                    <br />
                    3 rue des Canons
                    <br />
                    17220 La Jarrie
                  </p>
                </div>
              </div>
              <div className="frame__columns__contact">
                <div className="frame__columns__contact__row">
                  <span>Tel secrétariat :</span>
                  <p>06 00 00 00 00</p>
                </div>
                <div className="frame__columns__contact__row">
                  <span>Email :</span>
                  <p>contact@stemadeleine.fr</p>
                </div>
              </div>
            </div>
          </div>
          <p>
            Merci d&apos;envoyer votre chèque à l’adresse ci-dessus, accompagné de ce formulaire.
          </p>
          <form className="form" name="donation">
            <div className="form__block">
              <span>Je suis :</span>
              <label>
                <input
                  name="organisation"
                  type="radio"
                  value="option1"
                  checked={state.organisation === "option1"}
                  onChange={handleChange}
                />
                un particulier
              </label>
              <label>
                <input
                  name="organisation"
                  type="radio"
                  value="option2"
                  checked={state.organisation === "option2"}
                  onChange={handleChange}
                />
                une entreprise
              </label>
              <label>
                <input
                  name="organisation"
                  type="radio"
                  value="option3"
                  checked={state.organisation === "option3"}
                  onChange={handleChange}
                />
                une association.
              </label>
            </div>
            <div
              className={
                state.organisation === "option2" || state.organisation === "option3"
                  ? "form__block active"
                  : "form__block"
              }>
              <label>
                Raison Sociale :
                <input name="name" type="text" onChange={handleChange} />
              </label>
            </div>
            <div className="form__block">
              <label>
                Prénom :
                <input name="firstname" type="text" onChange={handleChange} />
              </label>
              <label>
                Nom :
                <input name="lastname" type="text" onChange={handleChange} />
              </label>
            </div>
            <div className="form__block">
              <label>
                Adresse :
                <input name="adress" type="text" onChange={handleChange} />
              </label>
            </div>
            <div className="form__block">
              <label>
                Code Postal :
                <input name="postalCode" type="text" onChange={handleChange} />
              </label>
              <label>
                Ville :
                <input name="city" type="text" onChange={handleChange} />
              </label>
            </div>
            <div className="form__block">
              <label>
                Pays :
                <input name="country" type="text" onChange={handleChange} />
              </label>
            </div>
            <div className="form__block">
              <label>
                Téléphone :<input type="tel" name="phone" pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" />
              </label>
            </div>
            <div className="form__block">
              <label>
                Email :
                <input type="email" name="email" />
              </label>
            </div>
            <div className="form__block">
              <label>
                <input
                  name="checkbox1"
                  type="checkbox"
                  checked={state.checkbox1}
                  onChange={handleCheckboxChange}
                />
                Je souhaite recevoir un reçu fiscal pour mon don.
              </label>
            </div>
            <div className="form__block">
              <label>
                <input
                  name="checkbox2"
                  type="checkbox"
                  checked={state.checkbox2}
                  onChange={handleCheckboxChange}
                />
                Je souhaite ajouter mon adresse email à la liste de diffusion de l’association pour
                être tenu au courant de ses activités (emails informatifs, newsletters). Le
                désabonnement est possible sur simple demande.
              </label>
            </div>
          </form>
        </div>
        <button className="btn btn--print no-style-btn" type="button" onClick={handlePrint}>
          Imprimer
        </button>
      </div>
    </main>
  );
}

export default DonationForm;
