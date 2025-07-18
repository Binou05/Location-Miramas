import React, { useRef,useState, useEffect } from 'react';
import './App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";




function App() {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    dateDebut: null,
    dateFin: null,
    adultes: 1,
    enfants: 0
  });

  const [reservations, setReservations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [montant, setMontantTotal] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const reservationRef = useRef();
  const [zoomImage, setZoomImage] = useState(null);
  
    const handleImageClick = (src) => {
      setZoomImage(src);
    };

    const closeZoom = () => {
      setZoomImage(null);
    };
  const fetchReservations = async () => {
    const res = await fetch("http://localhost:4000/api/reservation");
    const data = await res.json();
    if (res.ok) setReservations(data);
  };
  useEffect(() => {
    console.log("🔍 isAdmin :", localStorage.getItem("isAdmin"));
    if (localStorage.getItem("isAdmin") === "false") {
      setIsAdmin(true);
    }
  }, []);
  
  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (form.dateDebut && form.dateFin && form.dateFin > form.dateDebut) {
      const oneDay = 24 * 60 * 60 * 1000;
      const nights = Math.round((form.dateFin - form.dateDebut) / oneDay);
     
      const montant = nights * 110;
      setMontantTotal(montant);
    } else {
      setMontantTotal(0);
    }
  }, [form.dateDebut, form.dateFin, form.adultes, form.enfants]);

  const isDateReserved = (date) => {
    return reservations.some(res => {
      const start = new Date(res.dateDebut);
      const end = new Date(res.dateFin);
      return date >= start && date <= end;
    });
  };

  const isRangeAvailable = (start, end) => {
    return !reservations.some(res => {
      const resStart = new Date(res.dateDebut);
      const resEnd = new Date(res.dateFin);
      return (start <= resEnd && end >= resStart);
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.dateDebut || !form.dateFin) {
      setErrorMessage("Veuillez choisir une date de début et de fin.");
      return;
    }

    if (!isRangeAvailable(form.dateDebut, form.dateFin)) {
      setErrorMessage("❌ Une ou plusieurs dates sont déjà réservées.");
      return;
    }
   
      const reservationId = `${form.email
        }-${form.dateDebut?.toISOString()}-${form.dateFin?.toISOString()}`;

      // Prépare les données à enregistrer
      const reservationData = {
        nom: form.nom,
        email: form.email,
        dateDebut: form.dateDebut?.toISOString(),
        dateFin: form.dateFin?.toISOString(),
        montant,
        reservationId
      };

      // Enregistrement dans localStorage
      localStorage.setItem("reservationData", JSON.stringify(reservationData));

      try {
        // Crée la session Stripe
        const stripeRes = await fetch(
          "http://localhost:4000/api/create-checkout-session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reservationData),
          }
        );

        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          window.location.href = stripeData.url;
        } else {
          setErrorMessage(
            "Erreur lors de la création de la session de paiement."
          );
        }
      } catch (err) {
        console.error("❌ Erreur de paiement :", err);
        setErrorMessage("Erreur technique lors du paiement.");
      }
    };
  
// juste après handleSubmit, mais toujours dans ton composant App :
  const handleFormulePaiement = async (formuleNom, montant) => {
    setErrorMessage("");

    if (!form.dateDebut || !form.dateFin) {
      setErrorMessage("Veuillez choisir vos dates dans le calendrier.");
      return;
    }
    // Vérifie la disponibilité
    if (!isRangeAvailable(form.dateDebut, form.dateFin)) {
      setErrorMessage("❌ Une ou plusieurs dates sont déjà réservées.");
      return;
    }

    const reservationId = `${
      form.email
    }-${form.dateDebut?.toISOString()}-${form.dateFin?.toISOString()}`;

    const reservationData = {
      nom: form.nom,
      email: form.email,
      dateDebut: form.dateDebut?.toISOString(),
      dateFin: form.dateFin?.toISOString(),
      montant,
      reservationId,
      formule: formuleNom,
    };

    // Sauvegarde dans localStorage
    localStorage.setItem("reservationData", JSON.stringify(reservationData));

    try {
      const stripeRes = await fetch(
        "http://localhost:4000/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reservationData),
        }
      );

      const stripeData = await stripeRes.json();
      if (stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        setErrorMessage(
          "Erreur lors de la création de la session de paiement."
        );
      }
    } catch (err) {
      console.error("❌ Erreur de paiement :", err);
      setErrorMessage("Erreur technique lors du paiement.");
    }
  };

    return (
      <>
        <header className="site-header">
          <div className="logo-container">
            <img src="/images/Logo.jpg" alt="Logo" className="site-logo" />
          </div>
          <div className="site-info">
            <h1 className="site-name">Bienvenue chez Céline et Sarah</h1>
            <p className="contact-info">
              📍 34 impasse du pinson 13140 Miramas | ✉️ contact@ :
              celinecaron1978@gmail.com | 📞 07 67 68 45 35
            </p>
          </div>
        </header>

        <div className="App">
          <header className="hero">
            <div className="hero-text-box">
              <h1>Un séjour inoubliable à Miramas 🌞</h1>
            </div>
          </header>
          <div className="description-box">
            <p>
              Découvrez notre appartement tout confort à Miramas, à seulement 10
              minutes à pied de la gare , avec accès direct vers Paris et
              Marseille. Idéalement situé au cœur des Bouches-du-Rhône, notre
              logement vous offre le meilleur de la Provence : D’un côté, partez
              explorer les paysages époustouflants des Baux-de-Provence, les
              ruelles typiques de Saint-Rémy-de-Provence ou les marchés colorés
              de Salon-de-Provence. De l’autre, laissez-vous séduire par les
              eaux turquoise des calanques, les plages sauvages de la Côte
              Bleue, et les villages de pêcheurs comme Carry-le-Rouet. À deux
              pas de l'appartement, profitez du lac Saint-Suspy pour une balade
              au bord de l’eau, d’une partie de golf ou du charme du vieux
              Miramas. Sans oublier un peu de shopping au village de marques ou
              une glace artisanale chez le célèbre glacier Le Quillet. Que ce
              soit pour un week-end romantique, des vacances en famille ou un
              déplacement professionnel, c’est la destination parfaite pour
              allier détente, découverte et authenticité .
            </p>
            <p>
              Parfait pour un week-end en amoureux, des vacances en famille ou
              un déplacement professionnel.
            </p>
          </div>

          <div className="photo-placeholder">
            <h2>📸 Notre appartement en images</h2>
            <Slider
              dots={false}
              infinite={true}
              speed={500}
              slidesToShow={3}
              slidesToScroll={1}
              autoplay={true}
              autoplaySpeed={3000}
              responsive={[
                { breakpoint: 1024, settings: { slidesToShow: 2 } },
                { breakpoint: 600, settings: { slidesToShow: 1 } },
              ]}
            >
              <div>
                <img
                  src="/images/Appart4.jpg"
                  alt="Appartement 1"
                  className="apt-photo"
                />
              </div>
              <div>
                <img
                  src="/images/Appart.jpg"
                  alt="Appartement 2"
                  className="apt-photo"
                />
              </div>
              <div>
                <img
                  src="/images/Appart1.jpg"
                  alt="Appartement 3"
                  className="apt-photo"
                />
              </div>
              <div>
                <img
                  src="/images/Appart7.jpg"
                  alt="Appartement 4"
                  className="apt-photo"
                />
              </div>
              <div>
                <img
                  src="/images/Appart3.jpg"
                  alt="Appartement 5"
                  className="apt-photo"
                />
              </div>
              <div>
                <img
                  src="/images/Appart5.jpg"
                  alt="Appartement 6"
                  className="apt-photo"
                />
              </div>
              <div>
                <img
                  src="/images/Appart6.jpg"
                  alt="Appartement 7"
                  className="apt-photo"
                />
              </div>
              <div>
                <img
                  src="/images/Appart2.jpg"
                  alt="Appartement 8"
                  className="apt-photo"
                />
              </div>
            </Slider>
          </div>

          <section className="carousel-section">
            <h2>À découvrir à Miramas et ses alentours</h2>
            <Slider
              dots={false}
              infinite
              speed={500}
              slidesToShow={3}
              slidesToScroll={1}
              autoplay={true}
              autoplaySpeed={3000}
              centerMode={true}
              centerPadding="0px"
              responsive={[
                { breakpoint: 1024, settings: { slidesToShow: 2 } },
                { breakpoint: 600, settings: { slidesToShow: 1 } },
              ]}
            >
              <div>
                <img src="/images/gare-miramas.jpg" alt="Gare de Miramas" />
                <p className="caption">🚉 Gare de Miramas</p>
              </div>
              <div>
                <img src="/images/lac-saint-suspy.jpg" alt="Lac Saint-Suspy" />
                <p className="caption">🏞️ Lac Saint-Suspy</p>
              </div>
              <div>
                <img src="/images/golf-miramas.jpg" alt="Golf de Miramas" />
                <p className="caption">⛳ Golf de Miramas</p>
              </div>
              <div>
                <img src="/images/miramas-le-vieux.jpg" alt="Vieux Miramas" />
                <p className="caption">🏘️ Vieux Miramas</p>
              </div>
              <div>
                <img
                  src="/images/glace-le-quillet.jpg"
                  alt="Glacier Le Quillet"
                />
                <p className="caption">🍦 Glacier Le Quillet</p>
              </div>
              <div>
                <img
                  src="/images/village-des-marques.jpg"
                  alt="Village de Marques"
                />
                <p className="caption">🛍️ Village de Marques</p>
              </div>
              <div>
                <img
                  src="/images/baux-de-provence-.jpg"
                  alt="Baux de Provence"
                />
                <p className="caption">🏰 Baux de Provence</p>
              </div>
              <div>
                <img
                  src="/images/baux-village.jpg"
                  alt="Baux de Provence le village"
                />
                <p className="caption">🏡 Village des Baux</p>
              </div>
              <div>
                <img
                  src="/images/saint-remy-de-provence-st-paul.jpg"
                  alt="Saint Rémy de Provence le château Saint-Paul de Mausole"
                />
                <p className="caption">🏛️ Saint-Paul de Mausole</p>
              </div>
              <div>
                <img
                  src="/images/Saint-remy.jpg"
                  alt="Saint Rémy de Provence les ruelles"
                />
                <p className="caption">🪴 Ruelles de Saint Rémy</p>
              </div>
              <div>
                <img
                  src="/images/St-remy-village.jpg"
                  alt="Saint Rémy de Provence le village"
                />
                <p className="caption">🏘️ Village Saint Rémy</p>
              </div>
              <div>
                <img src="/images/carry-le-rouet.jpg" alt="Carry le Rouet" />
                <p className="caption">🌊 Carry-le-Rouet</p>
              </div>
              <div>
                <img
                  src="/images/carry-le-rouet-port.jpg"
                  alt="Carry le Rouet le port"
                />
                <p className="caption">⚓ Port de Carry-le-Rouet</p>
              </div>
              <div>
                <img
                  src="/images/Calanques.jpg"
                  alt="Les Calanques de Marseille"
                />
                <p className="caption">🗿 Calanques de Marseille</p>
              </div>
              <div>
                <img
                  src="/images/Calanque.jpg"
                  alt="Les Calanques de Marseille"
                />
                <p className="caption">🌅 Calanques (vue)</p>
              </div>
              <div>
                <img
                  src="/images/marche-artisanal-nocturne.jpg"
                  alt="Salon de Provence marché nocturne artisanal"
                />
                <p className="caption">🌙 Marché artisanal Salon</p>
              </div>
              <div>
                <img
                  src="/images/marche-provencale-traditionnel.jpg"
                  alt="Le marché provençal traditionnel"
                />
                <p className="caption">🥖 Marché provençal</p>
              </div>
            </Slider>
          </section>

          <section ref={reservationRef} className="form-section">
            <h2>📅 Réserver votre séjour</h2>
            <p>Sélectionnez vos dates et le nombre de personnes :</p>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nom"
                placeholder="Votre nom"
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Votre email"
                onChange={handleChange}
                required
              />
              <label>Nombre d'adultes :</label>
              <select
                name="adultes"
                value={form.adultes}
                onChange={handleChange}
              >
                {[1, 2].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <label>Nombre d'enfants (-12 ans) :</label>
              <select
                name="enfants"
                value={form.enfants}
                onChange={handleChange}
              >
                {[0, 1, 2].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <label>Date de début :</label>
              <DatePicker
                selected={form.dateDebut}
                onChange={(date) => setForm({ ...form, dateDebut: date })}
                selectsStart
                startDate={form.dateDebut}
                endDate={form.dateFin}
                dateFormat="dd/MM/yyyy"
                placeholderText="Choisir une date de début"
                className="calendar-input"
                filterDate={(date) => !isDateReserved(date)}
                minDate={new Date()}
              />
              <label>Date de fin :</label>
              <DatePicker
                selected={form.dateFin}
                onChange={(date) => setForm({ ...form, dateFin: date })}
                selectsEnd
                startDate={form.dateDebut}
                endDate={form.dateFin}
                minDate={form.dateDebut}
                dateFormat="dd/MM/yyyy"
                placeholderText="Choisir une date de fin"
                className="calendar-input"
                filterDate={(date) => !isDateReserved(date)}
              />
              <p>
                💶 Montant total : <strong>{montant.toFixed(2)} €</strong>
              </p>
              <button type="submit">Réserver et payer</button>
            </form>
          </section>

          <section className="reservation-formules">
            <h2>🌟 Nos formules spéciales</h2>
            <p>Envie d’un séjour clé en main ? Choisissez votre formule :</p>
            <div className="formules-grid">
              <div className="formule-card">
                <img
                  src="/images/Formule1.jpg"
                  alt="Formule Week-end Épicurien"
                />
                <h3>Week-end Épicurien</h3>
                <p className="formule-price">💶 300€ pour 2 personnes</p>
              </div>
              <div className="formule-card">
                <img
                  src="/images/Formule2.jpg"
                  alt="Formule Week-end Mère-Fille"
                />
                <h3>Week-end Mère-Fille</h3>
                <p className="formule-price">💶 300€ pour 2 personnes</p>
              </div>
              <div className="formule-card">
                <img src="/images/Formule3.jpg" alt="Formule Week-end Détox" />
                <h3>Week-end Détox</h3>
                <p className="formule-price">💶 310€ pour 2 personnes</p>
              </div>
              <div className="formule-card">
                <img
                  src="/images/Formule4.jpg"
                  alt="Formule Week-end en amoureux"
                />
                <h3>Week-end en amoureux</h3>
                <p className="formule-price">💶 210€ pour 2 personnes</p>
              </div>
            </div>
          </section>
          <div className="formulaire-rapide">
            <h3>📝 Réservez votre formule en quelques clics</h3>
            <p>
              Sélectionnez vos <b>dates</b>, saisissez votre <b>nom</b> et votre{" "}
              <b>email</b>, puis choisissez la formule :
            </p>

            {/* Ligne 1 : Nom et Email */}
            <div className="field-row">
              <div className="field-group">
                <label htmlFor="nom">Nom :</label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Votre nom"
                  value={form.nom}
                  onChange={handleChange}
                  name="nom"
                />
              </div>
              <div className="field-group">
                <label htmlFor="email">Email :</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Votre email"
                  value={form.email}
                  onChange={handleChange}
                  name="email"
                />
              </div>
            </div>

            {/* Ligne 2 : Date début et Date fin */}
            <div className="field-row">
              <div className="field-group">
                <label htmlFor="dateDebut">Date de début :</label>
                <input
                  id="dateDebut"
                  type="date"
                  value={
                    form.dateDebut
                      ? form.dateDebut.toISOString().substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setForm({ ...form, dateDebut: new Date(e.target.value) })
                  }
                />
              </div>
              <div className="field-group">
                <label htmlFor="dateFin">Date de fin :</label>
                <input
                  id="dateFin"
                  type="date"
                  value={
                    form.dateFin
                      ? form.dateFin.toISOString().substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setForm({ ...form, dateFin: new Date(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Ligne 3 : Sélecteur de formule */}
            <div className="field-row">
              <div className="field-group">
                <label htmlFor="formule">Formule :</label>
                <select
                  id="formule"
                  onChange={(e) =>
                    setForm({ ...form, formule: e.target.value })
                  }
                >
                  <option value="">Choisissez une formule</option>
                  <option value="Week-end Épicurien">Week-end Épicurien</option>
                  <option value="Week-end Mère-Fille">
                    Week-end Mère-Fille
                  </option>
                  <option value="Week-end Détox">Week-end Détox</option>
                  <option value="Week-end en amoureux">
                    Week-end en amoureux
                  </option>
                </select>
              </div>
            </div>

            {/* Bouton */}
            <div className="formules-rapide-actions">
              <button
                onClick={() => handleFormulePaiement(form.formule, montant)}
              >
                ✅ Réserver ma formule
              </button>
            </div>
          </div>

          <section className="cartes-menu">
            <h2>📜 Nos cartes</h2>
            <p>
              Découvrez nos cartes : petit-déjeuner, boissons, et plus encore.
            </p>

            <img
              src="/images/Table.jpg"
              alt="Table photo"
              className="menu-photo"
            />

            <div className="cartes-grid">
              <div className="menu-card">
                <img
                  src="/images/Petit-déjeuner.jpg"
                  alt="Menu Petit Déjeuner"
                  onClick={() => handleImageClick("/images/Petit-déjeuner.jpg")}
                  className="menu-image"
                />
              </div>
              <div className="menu-card">
                <img
                  src="/images/Petitdéj.jpg"
                  alt="Menu Petit Déjeuner"
                  onClick={() => handleImageClick("/images/Petitdéj.jpg")}
                  className="menu-image"
                />
              </div>
              <div className="menu-card">
                <img
                  src="/images/Boisson.jpg"
                  alt="Menu Boissons"
                  onClick={() => handleImageClick("/images/Boisson.jpg")}
                  className="menu-image"
                />
              </div>

              <div className="menu-card">
                <img
                  src="/images/Menu.jpg"
                  alt="Carte Snacks"
                  onClick={() => handleImageClick("/images/Menu.jpg")}
                  className="menu-image"
                />
              </div>
            </div>
          </section>
          {/* ✅ Modal de zoom */}
          {zoomImage && (
            <div className="zoom-overlay" onClick={closeZoom}>
              <div className="zoom-content">
                <img src={zoomImage} alt="Zoom" />
              </div>
            </div>
          )}

          <footer className="footer">
            {!isAdmin && (
              <button
                onClick={() => setShowPopup(true)}
                className="admin-reveal"
              >
                👀
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => (window.location.href = "/admin")}
                className="admin-button"
              >
                🔒 Espace Admin
              </button>
            )}
          </footer>

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup">
                <h3>Accès Admin 🔐</h3>
                <input
                  type="password"
                  placeholder="Entrez le code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                />
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        "http://localhost:4000/api/admin-auth",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ code: adminCode }),
                        }
                      );

                      const data = await res.json();
                      if (res.ok && data.success) {
                        setIsAdmin(true);
                        setShowPopup(false);
                        setAdminCode("");
                        localStorage.setItem("isAdmin", "true");
                        window.location.href = "/admin";
                      } else {
                        alert("❌ Code incorrect");
                      }
                    } catch (err) {
                      alert("Erreur lors de la vérification");
                    }
                  }}
                >
                  Valider
                </button>
                <button onClick={() => setShowPopup(false)}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

export default App;
