import { useNavigate } from "react-router-dom";
import { SecondaryButton } from "../../components";
import { useState } from "react";

function LoginPage() {
  const navigate = useNavigate();

    const [email, setEmail] = useState(""); // ou username, selon ton API
    const [keyApi, setKeyApi] = useState("");

  return (
    <div className="p-8">
      <h1>
      Page Login
      </h1>

      <div className="divide-x-0 divide-y-2 divide-solid divide-zinc-700 px-4">
              <div className="flex flex-col">
                <div className="flex max-w-[400px] flex-col gap-4 py-4">
                   className="mb-1 mt-0">🔐 Connexion Enedis</h2> : <h2 className="mb-1 mt-0">👋 Bienvenue</h2>}
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
  );
}

export default LoginPage;
