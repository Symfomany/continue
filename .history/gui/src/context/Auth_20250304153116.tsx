import {
  OrganizationDescription,
  ProfileDescription,
} from "core/config/ProfileLifecycleManager";
import { ControlPlaneSessionInfo } from "core/control-plane/client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ConfirmationDialog from "../components/dialogs/ConfirmationDialog";
import { useWebviewListener } from "../hooks/useWebviewListener";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setLastControlServerBetaEnabledStatus } from "../redux/slices/miscSlice";
import { setDialogMessage, setShowDialog } from "../redux/slices/uiSlice";

import { setSessionLocale } from "../redux/slices/sessionSlice";
import {
  updateOrgsThunk,
  updateProfilesThunk,
} from "../redux/thunks/profileAndOrg";
import { IdeMessengerContext } from "./IdeMessenger";

interface LoginResponse {
  account: any; 
  [key: string]: any; 
}

interface AuthContextType {
  session: ControlPlaneSessionInfo | undefined;
  logout: () => void;
  login: (useOnboarding: boolean, email: string, keyApi: string) => Promise<boolean | LoginResponse>; // Ajout des types ici et paramètres
  selectedProfile: ProfileDescription | null;
  profiles: ProfileDescription[] | null;
  refreshProfiles: () => void;
  controlServerBetaEnabled: boolean;
  organizations: OrganizationDescription[];
  selectedOrganization: OrganizationDescription | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const ideMessenger = useContext(IdeMessengerContext);

  // Session
  const [session, setSession] = useState<ControlPlaneSessionInfo | undefined>(
    undefined,
  );

  // Orgs
  const orgs = useAppSelector((store) => store.session.organizations);
  const selectedOrgId = useAppSelector(
    (store) => store.session.selectedOrganizationId,
  );
  const selectedOrganization = useMemo(() => {
    if (!selectedOrgId) {
      return null;
    }
    return orgs.find((p) => p.id === selectedOrgId) ?? null;
  }, [orgs, selectedOrgId]);

  // Profiles
  const profiles = useAppSelector((store) => store.session.availableProfiles);
  const selectedProfile = useAppSelector(
    (store) => store.session.selectedProfile,
  );

   const login: AuthContextType["login"] =  (useOnboarding: boolean, email: string, keyApi: string) => {
    return new Promise((resolve) => {
      
         fetch("http://localhost:8002/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, keyApi }), // Adapter les noms de champs si nécessaire
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.ok) {
                const session = data.user;
                session.account = {...data.user, auth:  new Date().getTime() }
                session.accessToken = data.user.api_key
                session.label = data.user.prenom + " " + data.user.nom
                // ideMessenger.request("getControlPlaneSessionInfo", {
                //   silent: false,
                //   useOnboarding: true,
                // })
              
                  setSession(session);
                  dispatch(setSessionLocale(session.account));
                  
                  resolve(session);
            } else {
              console.error("Login failed:", data.message);
              resolve(false);
            }
            })
          .catch((error) => {
            console.error("Login error:", error);
            resolve(false);
          });
          })
    }


  const logout = () => {
    dispatch(setShowDialog(true));
    dispatch(
      setDialogMessage(
        <ConfirmationDialog
          confirmText="Oui je confirme"
          cancelText="Annuler"
          text="Voulez-vous vous déconnecter de Enedis?"
          onConfirm={() => {
            setSession(undefined);
            ideMessenger.post("logoutOfControlPlane", undefined);
          }}
          onCancel={() => {
            dispatch(setDialogMessage(undefined));
            dispatch(setShowDialog(false));
          }}
        />,
      ),
    );
  };

  useWebviewListener("didChangeControlPlaneSessionInfo", async (data) => {
    setSession(data.sessionInfo);
    // On logout, clear the list of orgs
    if (!data.sessionInfo) {
      dispatch(updateOrgsThunk([]));
    }
  });

  useEffect(() => {
    ideMessenger
      .request("getControlPlaneSessionInfo", {
        silent: true,
        useOnboarding: false,
      })
      .then(
        (result) => result.status === "success" && setSession(result.content),
      );
  }, []);

  const [controlServerBetaEnabled, setControlServerBetaEnabled] =
    useState(false);

  useEffect(() => {
    ideMessenger.ide
      .getIdeSettings()
      .then(({ enableControlServerBeta, continueTestEnvironment }) => {
        setControlServerBetaEnabled(enableControlServerBeta);
        dispatch(
          setLastControlServerBetaEnabledStatus(enableControlServerBeta),
        );
      });
  }, []);

  useEffect(() => {
    if (session) {
      ideMessenger
        .request("controlPlane/listOrganizations", undefined)
        .then((result) => {
          if (result.status === "success") {
            dispatch(updateOrgsThunk(result.content));
          } else {
            dispatch(updateOrgsThunk([]));
          }
        });
    }
  }, [session]);

  useWebviewListener(
    "didChangeIdeSettings",
    async (msg) => {
      const { settings } = msg;
      setControlServerBetaEnabled(settings.enableControlServerBeta);
      dispatch(
        setLastControlServerBetaEnabledStatus(settings.enableControlServerBeta),
      );
    },
    [],
  );

  useEffect(() => {
    ideMessenger.request("config/listProfiles", undefined).then((result) => {
      if (result.status === "success") {
        dispatch(
          updateProfilesThunk({
            profiles: result.content,
            selectedProfileId: null,
          }),
        );
      }
    });
  }, []);

  const refreshProfiles = async () => {
    try {
      await ideMessenger.request("config/refreshProfiles", undefined);
      ideMessenger.post("showToast", ["info", "Config refreshed"]);
    } catch (e) {
      console.error("Failed to refresh profiles", e);
      ideMessenger.post("showToast", ["error", "Failed to refresh config"]);
    }
  };

  useWebviewListener(
    "didChangeAvailableProfiles",
    async (data) => {
      dispatch(
        updateProfilesThunk({
          profiles: data.profiles,
          selectedProfileId: data.selectedProfileId,
        }),
      );
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        logout,
        login,
        selectedProfile,
        profiles,
        refreshProfiles,
        selectedOrganization,
        organizations: orgs,
        controlServerBetaEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
