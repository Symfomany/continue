import { Listbox, Transition } from "@headlessui/react";
import { CheckCircleIcon, ChevronUpDownIcon, PencilIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, SecondaryButton, Textarea } from "../../components";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/Auth";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useNavigationListener } from "../../hooks/useNavigationListener";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addMessageTemplateAndSave, deleteMessageTemplateAndSave, selectProfileThunk, updateMessageTemplateAndSave, updatePersonnaThunk } from "../../redux/thunks/profileAndOrg";
import { ScopeSelect } from "./ScopeSelect";
import UserSettingsUI from "./UserSettings";
import { showToast } from "../../util/toast";
import {
  TemplateContainer,
  TemplateTitle,
  TemplateContent,
  TemplateActions,
  DeleteButton,
  AddButton,
  EditButton,
  EditorContainer
} from "./styled"; 
import {
  Editor,
  JSONContent
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TemplateEditor from "./TemplateEditor";

function convertTextToTipTapContent(text: string): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: text,
          },
        ],
      },
    ],
  };
}

function ConfigPage() {
  useNavigationListener();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);
  const [email, setEmail] = useState(""); // ou username, selon ton API
  const [keyApi, setKeyApi] = useState("");
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState < string | null > (null);
      const editorRef = useRef < HTMLDivElement > (null); // Ajout de la référence

   // Récupère les templates depuis le state Redux
  const messageTemplates = useAppSelector((state) => state.config.messageTemplates);
  const editor = useRef <Editor | null > (null);

    // Récupère la personna depuis le state Redux
  const personnaFromRedux = useAppSelector((state) => state.config.personna);
  const [personna, setPersonna] = useState(personnaFromRedux || "");

  const [editorContent, setEditorContent] = useState<JSONContent>(
    convertTextToTipTapContent(newTemplateContent)
  );
  
  useEffect(() => {
    if (personnaFromRedux !== personna) {
      setPersonna(personnaFromRedux || "");
    }
  }, [personnaFromRedux, setPersonna]);

  
    useEffect(() => {
      if (editorRef.current) {

        editor.current = new Editor({
          element: editorRef.current,
          extensions: [
            StarterKit,
            Image,
          ],
          content: '', // Initialize with empty content
        });
      }
  
      return () => {
        editor.current?.destroy();
      };
    }, []);

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

  function updatePersonna() {
    console.log("updatePersonna !!", personna);
    dispatch(updatePersonnaThunk(personna));
    showToast('Personna mise a jour', { type: 'success' });
  }

  
    const handleAddTemplate = () => {
        if (newTemplateTitle  && newTemplateContent) {
           dispatch(addMessageTemplateAndSave({
                title: newTemplateTitle,
                content: newTemplateContent
            }));
            setNewTemplateTitle("");
            setNewTemplateContent("");
        }
    };

    const handleUpdateTemplate = (templateId: string, updatedTitle: string, updatedContent: string) => {
        dispatch(updateMessageTemplateAndSave({
            id: templateId,
            title: updatedTitle,
            content: updatedContent,
            createdAt: new Date().toISOString()
        }));
        setEditingTemplateId(null);
        setNewTemplateTitle("");
        setNewTemplateContent("");
    };

    const handleDeleteTemplate = (templateId: string) => {
        dispatch(deleteMessageTemplateAndSave(templateId));
    };


  // NOTE Hub takes priority over Continue for Teams
  // Since teams will be moving to hub, not vice versa

  return (
    <div className="overflow-y-scroll">
      <PageHeader onTitleClick={() => navigate("/")} title="Chat" />
      <div className="divide-x-0 divide-y-2 divide-solid divide-zinc-700 px-4">
        <div className="flex flex-col">
          <div className="flex max-w-[400px] flex-col gap-4 py-4">
             {!session ? <h2 className="mb-1 mt-0">🔐 Connexion Enedis</h2> : <h2 className="mb-1 mt-0">👋 Bienvenue</h2>}
             {/* <img src={`${window.vscMediaUrl}/6723401-200.png`} height="25px" /> */}
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

                    <p>Decris ici ton personna</p>
                    <Textarea
                        value={personna}
                        rows={5}
                        onChange={(e) => {
                          setPersonna(e.target.value);
                        }}
                        placeholder="Ex: Développeur Java avec le framework Spring, SpringBot, Angular en frontend, Docker et CI/CD"
                      />
                    <small><i>Le personna sera utiliser en contexte des discussions</i></small>

                      <Button
                        onClick={updatePersonna}> <CheckCircleIcon className="size-6 text-green-500" /> Mettre a jour mon personna</Button>
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
                  >{`Se déconnecter`}</span>
                </div>
              </div>
            )}
          </div>
        </div>


    {session ? <div className="flex flex-col">
      <h2>📜 Gérer ses templates</h2>
          
         {!editingTemplateId && <div className="flex max-w-[400px] flex-col gap-4 py-6">
            <h4 className="mb-1 mt-0">Créer un template</h4>

              <Input
                type="text"
                placeholder="Titre du template"
                value={newTemplateTitle}
                onChange={(e) => setNewTemplateTitle(e.target.value)}
              />

               {/* <Textarea
                    placeholder="Contenu du template"
                    rows={5}
                    value={newTemplateContent}
                    onChange={(e) => setNewTemplateContent(e.target.value)}
                /> */}
                 <TemplateEditor
                  editorState={editorContent}
                  onChange={handleEditorChange}
                  placeholder="Saisissez votre texte ici..."
                />
              <div className="flex justify-end">
                <AddButton onClick={handleAddTemplate} className="flex items-center gap-2">
                  <PlusCircleIcon className="h-5 w-5" />
                  Ajouter le template
                </AddButton>
              </div>
      </div>}
        
      
      <div className="flex flex-col gap-2">
            {!editingTemplateId && <h4>Mes templates</h4>}
            {!messageTemplates.length && <div>Aucun template</div>}
            {messageTemplates.length && messageTemplates.map((template) => (
              <TemplateContainer key={template.id}>
                {editingTemplateId === template.id ? (
                  <div className="flex flex-col gap-2 p-4 border rounded-md bg-gray-70">
                    <Input
                      type="text"
                      defaultValue={template.title}
                      onChange={(e) => setNewTemplateTitle(e.target.value)}
                    />
                    <Textarea
                      defaultValue={template.content}
                      onChange={(e) => setNewTemplateContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => handleUpdateTemplate(template.id, newTemplateTitle, newTemplateContent)}>
                        Sauvegarder
                      </Button>
                      <SecondaryButton onClick={() => setEditingTemplateId(null)}>Annuler</SecondaryButton>
                    </div>
                  </div>
                ) : (
                  <>
                    <TemplateTitle>{template.title}</TemplateTitle>
                    <TemplateContent dangerouslySetInnerHTML={{ __html: template.content }} />
                    <TemplateActions>
                      <EditButton onClick={() => {
                        setEditingTemplateId(template.id);
                        setNewTemplateTitle(template.title);
                        setNewTemplateContent(template.content);
                      }} className="flex items-center gap-2">
                        <PencilIcon className="h-5 w-5" />
                      </EditButton>
                      <DeleteButton onClick={() => handleDeleteTemplate(template.id)} className="flex items-center gap-2">
                        <TrashIcon className="h-5 w-5" />
                      </DeleteButton>
                    </TemplateActions>
                  </>
                )}
              </TemplateContainer>
            ))}
          </div>
      </div> : null}



        <div className="flex flex-col">
          <div className="flex max-w-[400px] flex-col gap-4 py-6">
            <h2 className="mb-1 mt-0">⚙️ Configurer son modèle</h2>
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
