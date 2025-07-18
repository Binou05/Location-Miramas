// ✅ fichier : src/Paiement.js
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./components/CheckoutForm";
import "./App.css";


const stripePromise = loadStripe(
  "pk_test_51RicaMPFs5TDYPb5Lvd8hjprVTEbbuOuJg950rFDroC0sDH3DO4QEcqnpjHTPq6F6rKLIt2VuKi1GZXp7e8P8Ty100PVyvMcME"
); // remplace par ta clé publique test Stripe

function Paiement() {
  const location = useLocation();
  const { nom, email, dateDebut, dateFin, montant } = location.state || {};

  useEffect(() => {
    if (nom && email && dateDebut && dateFin && montant) {
      localStorage.setItem(
        "reservationData",
        JSON.stringify({ nom, email, dateDebut, dateFin, montant })
      );
    }
  }, [nom, email, dateDebut, dateFin, montant]);

  return (
    <div className="App">
      <h1>💳 Paiement sécurisé</h1>
      <p>Montant : {montant} €</p>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}

export default Paiement;
