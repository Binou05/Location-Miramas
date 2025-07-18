// ✅ fichier : src/Success.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("reservationData");
    if (!stored) return;

    const data = JSON.parse(stored);

    // Si l'e-mail a déjà été envoyé, on ne fait rien
    if (data.emailSent) return;

    // 1. Enregistrement MongoDB (le back envoie aussi l’e-mail ici)
    fetch("http://localhost:4000/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        // 2. Marquer comme envoyé pour éviter les doublons
        localStorage.setItem(
          "reservationData",
          JSON.stringify({ ...data, emailSent: true })
        );

        // 3. Nettoyage après 3 secondes
        setTimeout(() => {
          localStorage.removeItem("reservationData");
        }, 3000);
      })
      .catch((err) => console.error("❌ Erreur :", err));
  }, []);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="checkmark">✅</div>
        <h1>Paiement réussi !</h1>
        <p>Merci pour votre réservation 😊</p>
        <button onClick={() => navigate("/")}>Retour à l'accueil</button>
      </div>
    </div>
  );
};

export default Success;
