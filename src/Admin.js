import React, { useRef,useState, useEffect } from "react";
import "./App.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";


function Admin() {
  const [adminCode, setAdminCode] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const reservationRef = useRef();

  const fetchReservations = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/reservation", {
        headers: {
          "x-admin-code": adminCode,
        },
      });

      if (!res.ok) {
        throw new Error("Code incorrect ou accès refusé.");
      }

      const data = await res.json();
      setReservations(data);
      setAccessGranted(true);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage("");
    fetchReservations();
  };

  const reservedRanges = reservations.map((r) => ({
    start: new Date(r.dateDebut),
    end: new Date(r.dateFin),
  }));

  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;
    return reservedRanges.some(
      (range) => date >= range.start && date <= range.end
    );
  };
  const handleDownloadPDF = () => {
    const input = reservationRef.current;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let position = 0;

      if (imgHeight > pageHeight) {
        // gestion multi-pages
        let remainingHeight = imgHeight;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          remainingHeight -= pageHeight;
          position -= pageHeight;

          if (remainingHeight > 0) pdf.addPage();
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      pdf.save("reservations.pdf");
    });
  };
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      navigate("/"); // redirige vers la page d’accueil si pas admin
    }
  }, []);

  return (
    <div className="App admin-container">
      <h1 className="admin-title">🔐 Espace Administrateur</h1>

      {!accessGranted ? (
        <form onSubmit={handleLogin} className="admin-login">
          <input
            type="password"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            placeholder="Entrez le code admin"
            required
          />
          <button type="submit">Connexion</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      ) : (
        <div className="admin-dashboard">
          <section className="calendar-section">
            <h2>📅 Vue calendrier des réservations</h2>
            <Calendar tileDisabled={tileDisabled} />
          </section>

          <section className="reservation-cards" ref={reservationRef}>
            <h2>📋 Liste des réservations</h2>
            <div className="admin-cards">
              {reservations.map((r, i) => (
                <div key={i} className="admin-card">
                  <h3>👤 {r.nom}</h3>
                  <p>📧 {r.email}</p>
                  <p>
                    📅 du {new Date(r.dateDebut).toLocaleDateString()} au{" "}
                    {new Date(r.dateFin).toLocaleDateString()}
                  </p>
                  <p>
                    💶 Montant : <strong>{r.montant} €</strong>
                  </p>
                  <p className="paid-status">✅ Payé</p>
                  <button
                    onClick={async () => {
                      if (window.confirm("Confirmer la suppression ?")) {
                        await fetch(
                          `http://localhost:4000/api/reservation/${r._id}`,
                          {
                            method: "DELETE",
                          }
                        );
                        setReservations(
                          reservations.filter((res) => res._id !== r._id)
                        );
                      }
                    }}
                    className="delete-button"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              ))}
            </div>
          </section>
          <button onClick={handleDownloadPDF} className="download-pdf-button">
            📄 Télécharger en PDF
          </button>
        </div>
      )}
      <div style={{ textAlign: "right", margin: "1rem" }}>
        <button
          onClick={() => {
            localStorage.removeItem("isAdmin");
            navigate("/");
          }}
          style={{
            background: "#f44336",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🔓 Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default Admin;
