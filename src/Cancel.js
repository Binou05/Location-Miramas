import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="cancel-container">
      <div className="cancel-card">
        <div className="cancel-icon">❌</div>
        <h1>Paiement annulé</h1>
        <p>Votre paiement n'a pas été finalisé.</p>
        <p>Vous pouvez réessayer votre réservation à tout moment.</p>
        <button onClick={() => navigate("/")}>Retour à l'accueil</button>
      </div>
    </div>
  );
};

export default Cancel;
