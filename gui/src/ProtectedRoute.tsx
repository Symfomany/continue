import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { RootState } from './redux/store'; // Importe le type RootState de ton store Redux

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = useSelector((state: RootState) => state.session.session); // `session` peut être `null` ou avoir un type spécifique
  const location = useLocation();

  if (!session) {
    // L'utilisateur n'est pas authentifié, redirection vers la page de login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // L'utilisateur est authentifié, affichage du composant enfant
};

export default ProtectedRoute;

