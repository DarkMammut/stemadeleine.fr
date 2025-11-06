/* eslint-disable no-undef */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAxiosClient } from '../utils/axiosClient';
import useGetOrganization from '../hooks/useGetOrganization';
import Button from './Button';
import ReCaptcha from './ReCaptcha';
import './ContactPageContent.css';

function ValidateEmail(mail) {
  if (!mail) return false;
  const regexpEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return regexpEmail.test(mail);
}

function ValidateName(name) {
  if (!name) return false;
  const regexpName =
    /^[a-zA-ZàáâäãåąćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñčšžÀÁÂÄÃÅĄĆĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð '-]+$/u;
  return regexpName.test(name);
}

function ValidateMessage(message) {
  if (!message) return false;
  const strLength = message.length;
  return strLength >= 25;
}

const ContactPageContent = () => {
  const axiosClient = useAxiosClient();
  const { fetchOrganizationInfo, fetchOrganizationSettings } =
    useGetOrganization();
  const recaptchaRef = useRef(null);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [state, setState] = useState({});
  const [height, setHeight] = useState({});
  const [appear, setAppear] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [organizationData, setOrganizationData] = useState({
    name: "Les Amis de Sainte Madeleine de la Jarrie",
    address: "3 Rue des Canons",
    postalCode: "17220",
    city: "La Jarrie",
    email: "contact@stemadeleine.fr",
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fonction de chargement des données avec useCallback pour éviter les re-créations
  const loadOrganizationData = useCallback(async () => {
    if (dataLoaded) return; // Éviter les appels multiples

    try {
      console.log("🔄 Chargement des données d'organisation...");

      // Récupérer à la fois les infos et les paramètres
      const [info, settings] = await Promise.all([
        fetchOrganizationInfo(),
        fetchOrganizationSettings().catch(() => null), // Ne pas faire échouer si settings n'existe pas
      ]);

      if (info) {
        console.log("✅ Informations reçues:", info);
        console.log("⚙️ Paramètres reçus:", settings);

        // Mapper les données selon la structure de l'API
        setOrganizationData({
          name: info.name || "Les Amis de Sainte Madeleine de la Jarrie",
          // Récupérer l'adresse depuis l'objet address
          address: info.address?.addressLine1 || "3 Rue des Canons",
          postalCode: info.address?.postCode || "17220",
          // Nettoyer le nom de la ville (enlever le " (17)" s'il existe)
          city: info.address?.city?.replace(/ \(\d+\)/, "") || "La Jarrie",
          // Essayer de récupérer l'email des settings, sinon valeur par défaut
          email:
            settings?.contactEmail ||
            settings?.email ||
            "contact@stemadeleine.fr",
        });
      } else {
        console.warn("⚠️ Aucune information reçue de l'API");
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement des informations d'organisation:",
        error,
      );
      // Garder les valeurs par défaut en cas d'erreur
      console.warn(
        "Impossible de charger les informations d'organisation, utilisation des valeurs par défaut",
      );
    } finally {
      setDataLoaded(true); // Marquer comme chargé même en cas d'erreur
    }
  }, [fetchOrganizationInfo, fetchOrganizationSettings, dataLoaded]);

  // Charger les données d'organisation au montage du composant
  useEffect(() => {
    loadOrganizationData();
  }, [loadOrganizationData]);

  const handleChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });

    switch (e.target.name) {
      case "firstname":
        if (!ValidateName(e.target.value)) {
          setHeight({ ...height, [e.target.name]: "1rem" });
        } else {
          setHeight({ ...height, [e.target.name]: 0 });
        }
        break;

      case "lastname":
        if (!ValidateName(e.target.value)) {
          setHeight({ ...height, [e.target.name]: "1rem" });
        } else {
          setHeight({ ...height, [e.target.name]: 0 });
        }
        break;

      case "email":
        if (!ValidateEmail(e.target.value)) {
          setHeight({ ...height, [e.target.name]: "1rem" });
        } else {
          setHeight({ ...height, [e.target.name]: 0 });
        }
        break;

      case "subject":
        if (!ValidateName(e.target.value)) {
          setHeight({ ...height, [e.target.name]: "1rem" });
        } else {
          setHeight({ ...height, [e.target.name]: 0 });
        }
        break;

      case "message":
        if (!ValidateMessage(e.target.value)) {
          setHeight({ ...height, [e.target.name]: "1rem" });
        } else {
          setHeight({ ...height, [e.target.name]: 0 });
        }
        break;

      case "rgpd":
        if (!e.target.checked) {
          setHeight({ ...height, [e.target.name]: "1rem" });
        } else {
          setHeight({ ...height, [e.target.name]: 0 });
        }
        break;

      default:
        setHeight({ ...height, [e.target.name]: 0 });
    }

    // Vérifier si tous les champs sont valides pour activer/désactiver le bouton
    const updatedState = {
      ...state,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    };

    const isFormValid =
      updatedState.firstname &&
      ValidateName(updatedState.firstname) &&
      updatedState.lastname &&
      ValidateName(updatedState.lastname) &&
      updatedState.email &&
      ValidateEmail(updatedState.email) &&
      updatedState.subject &&
      ValidateName(updatedState.subject) &&
      updatedState.message &&
      ValidateMessage(updatedState.message) &&
      updatedState.rgpd &&
      recaptchaToken; // Include reCAPTCHA validation

    setButtonDisabled(!isFormValid);
  };

  const handleClick = () => {
    setAppear(0);
    // eslint-disable-next-line no-undef
    window.location.reload();
  };

  // Handle reCAPTCHA change
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  // Handle reCAPTCHA expiration
  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
  };

  // Handle reCAPTCHA error
  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    setSubmitError(
      "Erreur reCAPTCHA. Veuillez recharger la page et réessayer.",
    );
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Clear previous errors
      setSubmitError(null);

      // Validate form before submission
      if (
        !state.firstname ||
        !ValidateName(state.firstname) ||
        !state.lastname ||
        !ValidateName(state.lastname) ||
        !state.email ||
        !ValidateEmail(state.email) ||
        !state.subject ||
        !ValidateName(state.subject) ||
        !state.message ||
        !ValidateMessage(state.message) ||
        !state.rgpd ||
        !recaptchaToken
      ) {
        // eslint-disable-next-line no-undef
        console.error("Form validation failed");
        return;
      }

      setIsSubmitting(true);

      try {
        // Prepare contact data according to CreateContactRequest DTO
        const contactData = {
          firstName: state.firstname,
          lastName: state.lastname,
          email: state.email,
          subject: state.subject,
          message: state.message,
          recaptchaToken: recaptchaToken,
        };

        // Send POST request to backend API
        await axiosClient.post("/api/public/contact", contactData);

        // Success - show thank you modal and reset form
        // eslint-disable-next-line no-undef
        console.log("Contact form submitted successfully");
        setAppear(1);
        setState({});
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
        setButtonDisabled(true);
      } catch (error) {
        // eslint-disable-next-line no-undef
        console.error("Error submitting contact form:", error);

        // Handle different error types
        if (error.response?.status === 400) {
          setSubmitError("Veuillez vérifier les informations saisies.");
        } else if (error.response?.status >= 500) {
          setSubmitError("Erreur serveur. Veuillez réessayer plus tard.");
        } else if (error.code === "ECONNABORTED") {
          setSubmitError("Délai d'attente dépassé. Veuillez réessayer.");
        } else {
          setSubmitError("Une erreur est survenue. Veuillez réessayer.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [axiosClient, state, recaptchaToken],
  );

  return (
    <>
      {/* Section d'en-tête avec informations de contact */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
              Nous contacter
            </h2>
            <p className="mt-6 text-lg/8 text-gray-600">
              N&apos;hésitez pas à nous contacter pour toute question concernant
              l&apos;association, nos actions ou pour nous rejoindre dans la
              préservation de notre patrimoine religieux.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base/7 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div>
              <h3 className="border-l border-secondary-600 pl-6 font-semibold text-gray-900">
                Association
              </h3>
              <address className="border-l border-gray-200 pt-2 pl-6 text-gray-600 not-italic">
                <p>{organizationData.name}</p>
              </address>
            </div>
            <div>
              <h3 className="border-l border-secondary-600 pl-6 font-semibold text-gray-900">
                Adresse
              </h3>
              <address className="border-l border-gray-200 pt-2 pl-6 text-gray-600 not-italic">
                <p>{organizationData.address}</p>
                <p>
                  {organizationData.postalCode} {organizationData.city}
                </p>
              </address>
            </div>
            <div>
              <h3 className="border-l border-secondary-600 pl-6 font-semibold text-gray-900">
                Email
              </h3>
              <address className="border-l border-gray-200 pt-2 pl-6 text-gray-600 not-italic">
                <p>{organizationData.email}</p>
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* Section formulaire avec carte */}
      <div className="relative bg-white">
        <div className="lg:absolute lg:inset-0 lg:left-1/2">
          <div className="h-64 w-full bg-gray-50 sm:h-80 lg:absolute lg:h-full">
            <iframe
              title="Localisation de l'association"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2765.130235494945!2d-1.0144824226229212!3d46.128235588887435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48014b8dbeb53617%3A0x91605841ea9ff9e3!2sLes%20Amis%20de%20Sainte%20Madeleine%20de%20La%20Jarrie!5e0!3m2!1sfr!2sfr!4v1708610921512!5m2!1sfr!2sfr"
              width="100%"
              height="100%"
              allowFullScreen=""
              loading="lazy"
              className="border-0"
            />
          </div>
        </div>
        <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-2">
          <div className="px-6 lg:px-8">
            <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
              <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                Écrivez-nous
              </h2>
              <p className="mt-2 text-lg/8 text-gray-600">
                Votre message nous intéresse. N&apos;hésitez pas à nous faire
                part de vos questions, suggestions ou de votre souhait de
                rejoindre notre association.
              </p>
              <form onSubmit={handleSubmit} className="mt-16">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                  <div>
                    <label
                      htmlFor="firstname"
                      className="block text-sm/6 font-semibold text-gray-900 text-left"
                    >
                      Prénom
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="firstname"
                        name="firstname"
                        type="text"
                        autoComplete="given-name"
                        onChange={handleChange}
                        required
                        minLength="2"
                        className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none"
                      />
                    </div>
                    <div
                      className="text-sm text-red-600 mt-1 overflow-hidden transition-all duration-200"
                      style={{ maxHeight: height.firstname || 0 }}
                    >
                      Veuillez saisir un prénom valide.
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="lastname"
                      className="block text-sm/6 font-semibold text-gray-900 text-left"
                    >
                      Nom
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="lastname"
                        name="lastname"
                        type="text"
                        autoComplete="family-name"
                        onChange={handleChange}
                        required
                        minLength="2"
                        className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none"
                      />
                    </div>
                    <div
                      className="text-sm text-red-600 mt-1 overflow-hidden transition-all duration-200"
                      style={{ maxHeight: height.lastname || 0 }}
                    >
                      Veuillez saisir un nom de famille valide.
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm/6 font-semibold text-gray-900 text-left"
                    >
                      Email
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        onChange={handleChange}
                        required
                        className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none"
                      />
                    </div>
                    <div
                      className="text-sm text-red-600 mt-1 overflow-hidden transition-all duration-200"
                      style={{ maxHeight: height.email || 0 }}
                    >
                      Veuillez indiquer une adresse email valide.
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm/6 font-semibold text-gray-900 text-left"
                    >
                      Sujet
                    </label>
                    <div className="mt-2.5">
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        onChange={handleChange}
                        required
                        minLength="2"
                        className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none"
                      />
                    </div>
                    <div
                      className="text-sm text-red-600 mt-1 overflow-hidden transition-all duration-200"
                      style={{ maxHeight: height.subject || 0 }}
                    >
                      Le sujet doit contenir au moins 2 caractères.
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm/6">
                      <label
                        htmlFor="message"
                        className="block text-sm/6 font-semibold text-gray-900 text-left"
                      >
                        Comment pouvons-nous vous aider ?
                      </label>
                      <p id="message-description" className="text-gray-400">
                        Minimum 25 caractères
                      </p>
                    </div>
                    <div className="mt-2.5">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        aria-describedby="message-description"
                        onChange={handleChange}
                        required
                        minLength="25"
                        className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none"
                        defaultValue={""}
                      />
                    </div>
                    <div
                      className="text-sm text-red-600 mt-1 overflow-hidden transition-all duration-200"
                      style={{ maxHeight: height.message || 0 }}
                    >
                      Le message doit contenir au moins 25 caractères.
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start space-x-3">
                      <input
                        id="rgpd"
                        name="rgpd"
                        type="checkbox"
                        onChange={handleChange}
                        required
                        className="mt-1 w-5 h-5 text-orange-600 border-2 border-gray-300 rounded-sm focus:ring-orange-500 focus:ring-2 focus:ring-offset-2"
                      />
                      <label htmlFor="rgpd" className="text-sm text-gray-600">
                        En soumettant ce formulaire, j&apos;accepte que mes
                        informations soient utilisées exclusivement dans le
                        cadre de ma demande et de la relation éthique qui
                        pourrait en découler.
                      </label>
                    </div>
                    <div
                      className="text-sm text-red-600 mt-1 overflow-hidden transition-all duration-200"
                      style={{ maxHeight: height.rgpd || 0 }}
                    >
                      Veuillez cocher la case.
                    </div>
                  </div>
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center mt-8">
                  <ReCaptcha
                    ref={recaptchaRef}
                    siteKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} // eslint-disable-line no-undef
                    onChange={handleRecaptchaChange}
                    onExpired={handleRecaptchaExpired}
                    onError={handleRecaptchaError}
                  />
                </div>

                {/* Display error message if any */}
                {submitError && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}

                <div className="mt-10 flex justify-end border-t border-gray-900/10 pt-8">
                  <Button
                    type="submit"
                    disabled={buttonDisabled || isSubmitting}
                    variant="primary"
                    size="md"
                  >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de remerciement */}
      {appear === 1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          <div className="thank-you-modal flex flex-col justify-center items-center animate-fade-in">
            <svg className="w-24 h-24 mx-auto mb-6" viewBox="0 0 130.2 130.2">
              <circle
                className="animate-draw-circle"
                fill="none"
                stroke="#73AF55"
                strokeWidth="6"
                strokeMiterlimit="10"
                cx="65.1"
                cy="65.1"
                r="62.1"
              />
              <polyline
                className="animate-draw-check"
                fill="none"
                stroke="#73AF55"
                strokeWidth="6"
                strokeLinecap="round"
                strokeMiterlimit="10"
                points="100.2,40.2 51.5,88.8 29.8,67.5 "
              />
            </svg>
            <p className="text-xl font-semibold text-gray-800 mb-6">
              Merci pour votre message
              <br />
              <br />
              {state.firstname} {state.lastname}
            </p>
            <Button
              type="button"
              onClick={handleClick}
              variant="primary"
              size="lg"
              className="rounded-full font-quicksand"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactPageContent;
