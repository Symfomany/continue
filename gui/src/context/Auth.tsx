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
import { IdeMessengerContext } from "./IdeMessenger";
import {
  updateOrgsThunk,
  updateProfilesThunk,
} from "../redux/thunks/profileAndOrg";

interface AuthContextType {
  session: ControlPlaneSessionInfo | undefined;
  logout: () => void;
  login: (useOnboarding: boolean, email: string, keyApi: string) => Promise<boolean>; // Ajout des types ici et paramètres
  selectedProfile: ProfileDescription | null;
  profiles: ProfileDescription[];
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
  const selectedProfileId = useAppSelector(
    (store) => store.session.selectedProfileId,
  );
  const selectedProfile = useMemo(() => {
    if (!selectedProfileId) {
      return null;
    }
    return profiles.find((p) => p.id === selectedProfileId) ?? null;
  }, [profiles, selectedProfileId]);

   const login: AuthContextType["login"] = (useOnboarding: boolean, email: string, keyApi: string) => {
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
                session.account = {...data.user}
                session.accessToken = data.user.api_key
                session.label = data.user.prenom + " " + data.user.nom
                // ideMessenger.request("getControlPlaneSessionInfo", {
                //   silent: false,
                //   useOnboarding: true,
                // })
              
                  setSession(session);
                  resolve(true);
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
          confirmText="Yes, log out"
          text="Are you sure you want to log out of Continue by Enedis?"
          onConfirm={() => {
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
    } else {
      dispatch(updateOrgsThunk([]));
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
        dispatch(updateProfilesThunk(result.content));
      }
    });
  }, []);

  useWebviewListener(
    "didChangeAvailableProfiles",
    async (data) => {
      dispatch(updateProfilesThunk(data.profiles));
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
