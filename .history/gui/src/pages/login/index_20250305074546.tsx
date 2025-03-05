import { usePostHog } from "posthog-js/react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, SecondaryButton } from "../../components";
import { useAuth } from "../../context/Auth";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useAppDispatch } from "../../redux/hooks";
import { createSession } from "../../redux/thunks/session";
import { isJetBrains } from "../../util";
import { showToast } from "../../util/toast";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const posthog = usePostHog();
  const ideMessenger = useContext(IdeMessengerContext);
  const [email, setEmail] = useState(""); // ou username, selon ton API
  const [keyApi, setKeyApi] = useState("");
  const {
      login,
      session,
      logout,
  } = useAuth();
  

  const handleSubmit = async () => {
  
      const success = await login(false, email, keyApi);
      if (success) {
          showToast("Ravis de vous revoir 👋", { type: 'success', duration: 3000, direction: 'top' });
          let sessionLite = {
              action: "login",
              ide: isJetBrains() ? "Intellij" : "VSCode",
            }
            posthog.capture("login", sessionLite);
  
            dispatch(createSession({ sessionLite }));
  
      } else {
        console.error("Login failed");
         ideMessenger.post("showToast", [
          "error",
          "Mauvais login / mot de passe OU API Key",
        ]);
      }
    };


  return (
    <div className="p-8">
      <h1>
      Page Login
      </h1>

      <div className="divide-x-0 divide-y-2 divide-solid divide-zinc-700 px-4">
              <div className="flex flex-col">
                <div className="flex max-w-[400px] flex-col gap-4 py-4">
                   <h2 className="mb-1 mt-0">🔐 Connexion Enedis</h2>
                   {/* <img src={`${window.vscMediaUrl}/6723401-200.png`} height="25px" /> */}
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
                </div>
          </div>
    </div>
  </div>
  );
}

export default LoginPage;
