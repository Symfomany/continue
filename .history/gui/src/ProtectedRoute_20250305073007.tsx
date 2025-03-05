import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const auth = useSelector((store) => store.session.session); // Assuming session data is stored in store.session.session
  const location = useLocation();

  if (!auth) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // User is authenticated, render the component
};

export default ProtectedRoute;
