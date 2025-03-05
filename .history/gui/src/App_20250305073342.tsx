import { RouterProvider, createMemoryRouter } from "react-router-dom";
import Layout from "./components/Layout";
import { SubmenuContextProvidersProvider } from "./context/SubmenuContextProviders";
import { VscThemeProvider } from "./context/VscTheme";
import useSetup from "./hooks/useSetup";
import { AddNewModel, ConfigureProvider } from "./pages/AddNewModel";
import ConfigPage from "./pages/config";
import ConfigErrorPage from "./pages/config-error";
import ErrorPage from "./pages/error";
import Chat from "./pages/gui";
import History from "./pages/history";
import Login from "./pages/login";
import MigrationPage from "./pages/migration";
import MorePage from "./pages/More";
import Stats from "./pages/stats";
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from "./util/navigation";

const router = createMemoryRouter([
  {
    path: ROUTES.HOME,
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/index.html",
        element: <ProtectedRoute><Chat /></ProtectedRoute>,
      },
      {
        path: ROUTES.HOME,
        element: <ProtectedRoute><Chat /></ProtectedRoute>,
      },
      {
        path: "/history",
        element: <ProtectedRoute><History /></ProtectedRoute>,
      },
      {
        path: "/stats",
        element: <ProtectedRoute><Stats /></ProtectedRoute>,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/addModel",
        element: <ProtectedRoute><AddNewModel /></ProtectedRoute>,
      },
      {
        path: "/addModel/provider/:providerName",
        element: <ProtectedRoute><ConfigureProvider /></ProtectedRoute>,
      },
      {
        path: "/more",
        element: <ProtectedRoute><MorePage /></ProtectedRoute>,
      },
      {
        path: ROUTES.CONFIG_ERROR,
        element: <ProtectedRoute><ConfigErrorPage /></ProtectedRoute>,
      },
      {
        path: ROUTES.CONFIG,
        element: <ProtectedRoute><ConfigPage /></ProtectedRoute>,
      },
      {
        path: "/migration",
        element: <ProtectedRoute><MigrationPage /></ProtectedRoute>,
      },
    ],
  },
]);

/*
  Prevents entire app from rerendering continuously with useSetup in App
  TODO - look into a more redux-esque way to do this
*/
function SetupListeners() {
  useSetup();
  return <></>;
}

function App() {
  return (
    <VscThemeProvider>
      <SubmenuContextProvidersProvider>
            <RouterProvider router={router} />
      </SubmenuContextProvidersProvider>
      <SetupListeners />
    </VscThemeProvider>
  );
}

export default App;
