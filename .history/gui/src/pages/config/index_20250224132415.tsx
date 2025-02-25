import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, SecondaryButton } from "../../components";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/Auth";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useNavigationListener } from "../../hooks/useNavigationListener";
import { useAppDispatch } from "../../redux/hooks";
import { selectProfileThunk } from "../../redux/thunks/profileAndOrg";
import { ScopeSelect } from "./ScopeSelect";
import UserSettingsUI from "./UserSettings";
function ConfigPage() {
  useNavigationListener();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);
  const [email, setEmail] = useState(""); // ou username, selon ton API
  const [keyApi, setKeyApi] = useState("");


  const { login } = useAuth(); // Utilise la fonction `login` existante
  const {
    session,
    logout,
    profiles,
    selectedProfile,
    controlServerBetaEnabled,
    selectedOrganization,
  } = useAuth();

    const handleSubmit = async () => {

    const success = await login(false, email, keyApi);
    if (success) {
      console.log("OK LOGED", success)
    } else {
      console.error("Login failed");
       ideMessenger.post("showToast", [
        "error",
        "Mauvais login / mot de passe OU API Key",
      ]);
    }
  };

  const changeProfileId = (id: string) => {
    console.log("selecting 2", id);
    dispatch(selectProfileThunk(id));
  };

  const [hubEnabled, setHubEnabled] = useState(false);
  useEffect(() => {
    ideMessenger.ide.getIdeSettings().then(({ continueTestEnvironment }) => {
      setHubEnabled(continueTestEnvironment === "production");
    });
  }, [ideMessenger]);

  function handleOpenConfig() {
    if (!selectedProfile) {
      return;
    }
    ideMessenger.post("config/openProfile", {
      profileId: selectedProfile.id,
    });
  }

  // NOTE Hub takes priority over Continue for Teams
  // Since teams will be moving to hub, not vice versa

  return (
    <div className="overflow-y-scroll">
      <PageHeader onTitleClick={() => navigate("/")} title="Chat" />

      <div className="divide-x-0 divide-y-2 divide-solid divide-zinc-700 px-4">
        <div className="flex flex-col">
          <div className="flex max-w-[400px] flex-col gap-4 py-4">
            <h2 className="mb-1 mt-0">Connexion Enedis</h2>
            {!session ? (
              <div className="flex flex-col gap-2">
                <span>E-mail et Mot de passe</span>
                 <div className="flex flex-col gap-2">
                      <Input
                        type="text"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                        placeholder="E-mail"
                      />
                      <Input
                        type="text"
                        value={keyApi}
                        onChange={(e) => {
                          setKeyApi(e.target.value);
                        }}
                        placeholder="Key API"
                      />
                    <SecondaryButton onClick={handleSubmit}>Connexion</SecondaryButton>
                  </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {hubEnabled ? (
                  // Hub: show org selector
                  <div className="flex flex-col gap-1.5">
                    <span className="text-lightgray">{`Organization`}</span>
                    <ScopeSelect />
                  </div>
                ) : (
                  // Continue for teams: show org text
                  <>
                    <div>Bienvenue sur le plugin CodeEnedi</div>
                    <p>Pour commencer, decris ton profil ici</p>
                  </>
                )}
                <div className="flex flex-row items-center gap-2">
                  <span className="text-lightgray">
                    {session.account.prenom === ""
                      ? "Signed in"
                      : `Connecté sur ${session.account.prenom} ${session.account.nom}`}
                  </span>
                  <span
                    onClick={logout}
                    className="text-lightgray cursor-pointer underline"
                  >{`Sign out`}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex max-w-[400px] flex-col gap-4 py-6">
            <h2 className="mb-1 mt-0">Configuration</h2>
            {profiles ? (
              <>
                {selectedProfile && (
                  <SecondaryButton onClick={handleOpenConfig}>
                    {selectedProfile.id === "local"
                      ? "Configuration locale"
                      : hubEnabled
                        ? "Open Assistant"
                        : "Open Workspace"}
                  </SecondaryButton>
                )}
              </>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
        {!controlServerBetaEnabled || hubEnabled ? (
          <div className="flex flex-col">
            <div className="flex max-w-[400px] flex-col">
              <UserSettingsUI />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ConfigPage;
