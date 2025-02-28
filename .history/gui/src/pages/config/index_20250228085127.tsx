import { ModelRole } from "@continuedev/config-yaml";
import { Listbox, Transition } from "@headlessui/react";
import { CheckCircleIcon, ChevronUpDownIcon, PencilIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Fragment, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, SecondaryButton, Textarea } from "../../components";
import {
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ModelDescription } from "core";
import {
  SharedConfigSchema,
  modifyAnyConfigWithSharedConfig,
} from "core/config/sharedConfig";
import NumberInput from "../../components/gui/NumberInput";
import { Select } from "../../components/gui/Select";
import ToggleSwitch from "../../components/gui/Switch";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/Auth";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useNavigationListener } from "../../hooks/useNavigationListener";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addMessageTemplateAndSave, deleteMessageTemplateAndSave, updateMessageTemplateAndSave, updatePersonnaThunk } from "../../redux/thunks/profileAndOrg";
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



import { setDefaultModel, updateConfig } from "../../redux/slices/configSlice";
import { selectProfileThunk } from "../../redux/thunks/profileAndOrg";
import { getFontSize, isJetBrains } from "../../util";
import ModelRoleSelector from "./ModelRoleSelector";
import { ScopeSelect } from "./ScopeSelect";

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

  const [editorContent, setEditorContent] = useState<JSONContent | null>(null); // Now JSONContent


  const handleEditTemplate = (template: any) => {
        setEditingTemplateId(template.id);
        setNewTemplateTitle(template.title);
        setNewTemplateContent(template.content);
        setEditorContent(JSON.parse(template.content)); // Mettre à jour editorContent
    };

  const handleEditorChange = useCallback((content: JSONContent) => {
    // Convertir le contenu TipTap en texte brut pour l'afficher dans la Textarea
    setNewTemplateContent(JSON.stringify(content)); // Store the content as JSON string
    setEditorContent(content);
  }, []);

useEffect(() => {
        if (editorRef.current) {

            editor.current = new Editor({
                element: editorRef.current,
                extensions: [
                    StarterKit,
                    Image,
                ],
                content: editorContent, // Initialize with editorContent
            });
        }

        return () => {
            editor.current?.destroy();
        };
    }, []);
  
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
            setEditorContent(null);
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
        setEditorContent(null);
    };

    const handleDeleteTemplate = (templateId: string) => {
        dispatch(deleteMessageTemplateAndSave(templateId));
    };


  // NOTE Hub takes priority over Continue for Teams
  // Since teams will be moving to hub, not vice versa

  /////// User settings section //////
  const config = useAppSelector((state) => state.config.config);
  const selectedChatModel = useAppSelector(
    (store) => store.config.defaultModelTitle,
  );

  function handleUpdate(sharedConfig: SharedConfigSchema) {
    // Optimistic update
    const updatedConfig = modifyAnyConfigWithSharedConfig(config, sharedConfig);
    dispatch(updateConfig(updatedConfig));
    // IMPORTANT no need for model role updates (separate logic for selected model roles)
    // simply because this function won't be used to update model roles

    // Actual update to core which propagates back with config update event
    ideMessenger.post("config/updateSharedConfig", sharedConfig);
  }

  function handleRoleUpdate(role: ModelRole, model: ModelDescription | null) {
    if (!selectedProfile) {
      return;
    }
    // Optimistic update
    dispatch(
      updateConfig({
        ...config,
        selectedModelByRole: {
          ...config.selectedModelByRole,
          [role]: model,
        },
      }),
    );
    ideMessenger.post("config/updateSelectedModel", {
      profileId: selectedProfile.id,
      role,
      title: model?.title ?? null,
    });
  }

  // TODO use handleRoleUpdate for chat
  function handleChatModelSelection(model: ModelDescription | null) {
    if (!model) {
      return;
    }
    dispatch(setDefaultModel({ title: model.title }));
  }

  // TODO defaults are in multiple places, should be consolidated and probably not explicit here
  const showSessionTabs = config.ui?.showSessionTabs ?? false;
  const codeWrap = config.ui?.codeWrap ?? false;
  const showChatScrollbar = config.ui?.showChatScrollbar ?? false;
  const displayRawMarkdown = config.ui?.displayRawMarkdown ?? false;
  const disableSessionTitles = config.disableSessionTitles ?? false;
  const readResponseTTS = config.experimental?.readResponseTTS ?? false;

  const allowAnonymousTelemetry = config.allowAnonymousTelemetry ?? true;
  const disableIndexing = config.disableIndexing ?? false;

  const useAutocompleteCache = config.tabAutocompleteOptions?.useCache ?? false;
  const useChromiumForDocsCrawling =
    config.experimental?.useChromiumForDocsCrawling ?? false;
  const codeBlockToolbarPosition = config.ui?.codeBlockToolbarPosition ?? "top";
  const useAutocompleteMultilineCompletions =
    config.tabAutocompleteOptions?.multilineCompletions ?? "auto";
  const fontSize = getFontSize();

  // Disable autocomplete
  const disableAutocompleteInFiles = (
    config.tabAutocompleteOptions?.disableInFiles ?? []
  ).join(", ");
  const [formDisableAutocomplete, setFormDisableAutocomplete] = useState(
    disableAutocompleteInFiles,
  );
  const cancelChangeDisableAutocomplete = () => {
    setFormDisableAutocomplete(disableAutocompleteInFiles);
  };
  const handleDisableAutocompleteSubmit = () => {
    handleUpdate({
      disableAutocompleteInFiles: formDisableAutocomplete
        .split(",")
        .map((val) => val.trim())
        .filter((val) => !!val),
    });
  };

  useEffect(() => {
    // Necessary so that reformatted/trimmed values don't cause dirty state
    setFormDisableAutocomplete(disableAutocompleteInFiles);
  }, [disableAutocompleteInFiles]);

  // Workspace prompts
  const promptPath = config.experimental?.promptPath || "";
  const [formPromptPath, setFormPromptPath] = useState(promptPath);
  const cancelChangePromptPath = () => {
    setFormPromptPath(promptPath);
  };
  const handleSubmitPromptPath = () => {
    handleUpdate({
      promptPath: formPromptPath || "",
    });
  };

  useEffect(() => {
    // Necessary so that reformatted/trimmed values don't cause dirty state
    setFormPromptPath(promptPath);
  }, [promptPath]);

  const jetbrains = isJetBrains();

  return (
    <div className="overflow-y-scroll">
      <PageHeader onTitleClick={() => navigate("/")} title="Chat" />
      <div className="divide-x-0 divide-y-2 divide-solid divide-zinc-700 px-4">
<<<<<<< HEAD
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
 
                      <Button className="bg-black text-white"
                        onClick={updatePersonna}> <CheckCircleIcon className="h-4 w-4 text-green-500" /> Mettre a jour mon personna</Button>
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
=======
        {(session || hubEnabled || controlServerBetaEnabled) && (
          <div className="flex flex-col">
            <div className="flex max-w-[400px] flex-col gap-4 py-4">
              <h2 className="mb-1 mt-0">Account</h2>
              {!session ? (
                <div className="flex flex-col gap-2">
                  <span>You are not signed in.</span>
                  <SecondaryButton onClick={() => login(false)}>
                    Sign in
                  </SecondaryButton>
>>>>>>> upstream/main
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
                    <div>You are using Continue for Teams</div>
                  )}
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-lightgray">
                      {session.account.label === ""
                        ? "Signed in"
                        : `Signed in as ${session.account.label}`}
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
        )}


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
            {!editingTemplateId && messageTemplates.length ? <h2>Mes templates</h2> : <></>}
            {messageTemplates.length ? messageTemplates.map((template) => (
              <TemplateContainer key={template.id}>
                {editingTemplateId === template.id ? (
                  <div className="flex flex-col gap-2 p-4 border rounded-md bg-gray-70">
                    <Input
                      type="text"
                      defaultValue={template.title}
                      onChange={(e) => setNewTemplateTitle(e.target.value)}
                    />
                     <TemplateEditor
                      editorState={editorContent}
                      onChange={handleEditorChange}
                      placeholder="Saisissez votre texte ici..."
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
                    <TemplateActions>
                      <EditButton onClick={() => handleEditTemplate(template)} className="flex items-center gap-2">
                        <PencilIcon className="h-3 w-3" />
                      </EditButton>
                      <DeleteButton onClick={() => handleDeleteTemplate(template.id)} className="flex items-center gap-2">
                        <TrashIcon className="h-3 w-3" />
                      </DeleteButton>
                    </TemplateActions>
                  </>
                )}
              </TemplateContainer>
            ) ) : <></>} 
          </div>
      </div> : null}



        <div className="flex flex-col">
          <div className="flex max-w-[400px] flex-col gap-4 py-6">
            <h2 className="mb-1 mt-0">⚙️ Configurer son modèle</h2>
            {profiles ? (
              <>
<<<<<<< HEAD
=======
                <div className="flex flex-col gap-1.5">
                  <span className="text-lightgray">{`${hubEnabled ? "Assistant" : "Profile"}`}</span>
                  <Listbox
                    value={selectedProfile?.id}
                    onChange={changeProfileId}
                  >
                    {({ open }) => (
                      <div className="relative w-full">
                        <Listbox.Button className="border-vsc-input-border bg-vsc-background hover:bg-vsc-input-background text-vsc-foreground relative m-0 flex w-full cursor-pointer items-center justify-between rounded-md border border-solid px-3 py-2 text-left">
                          <span className="lines lines-1">
                            {selectedProfile?.title ?? "No Assistant Selected"}
                          </span>
                          <div className="pointer-events-none flex items-center">
                            <ChevronUpDownIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </div>
                        </Listbox.Button>

                        <Transition
                          as={Fragment}
                          show={open}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Listbox.Options className="bg-vsc-background max-h-80vh absolute z-50 mt-0.5 w-full overflow-y-scroll rounded-sm p-0">
                            {profiles.map((option, idx) => (
                              <Listbox.Option
                                key={idx}
                                value={option.id}
                                className={`text-vsc-foreground hover:text-list-active-foreground flex cursor-pointer flex-row items-center gap-3 px-3 py-2 ${selectedProfile?.id === option.id ? "bg-list-active" : "bg-vsc-input-background"}`}
                              >
                                <span className="lines lines-1 relative flex h-5 items-center justify-between gap-3 pr-2 text-xs">
                                  {option.title}
                                </span>
                              </Listbox.Option>
                            ))}
                            {hubEnabled && (
                              <Listbox.Option
                                key={"no-profiles"}
                                value={null}
                                className={`text-vsc-foreground hover:bg-list-active bg-vsc-input-background flex cursor-pointer flex-row items-center gap-2 px-3 py-2`}
                                onClick={() => {
                                  if (session) {
                                    ideMessenger.post("controlPlane/openUrl", {
                                      path: "new",
                                      orgSlug: selectedOrganization?.slug,
                                    });
                                  } else {
                                    login(false);
                                  }
                                }}
                              >
                                <PlusCircleIcon className="h-4 w-4" />
                                <span className="lines lines-1 flex items-center justify-between text-xs">
                                  Create new Assistant
                                </span>
                              </Listbox.Option>
                            )}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    )}
                  </Listbox>
                </div>
>>>>>>> upstream/main
                {selectedProfile && (
                  <SecondaryButton onClick={handleOpenConfig}>
                    {selectedProfile.id === "local"
                      ? "Configuration locale"
                      : hubEnabled
                        ? "Open Assistant"
                        : "Open Workspace"}
                  </SecondaryButton>
                )}
                {/* {hubEnabled && session && (
                  <div className="flex flex-col gap-1">
                    <span>{`If your hub secret values may have changed, refresh your assistants`}</span>
                    <SecondaryButton onClick={refreshProfiles}>
                      Refresh assistants
                    </SecondaryButton>
                  </div>
                )} */}
              </>
            ) : (
              <div>Loading...</div>
            )}
            <div>
              <h2 className="m-0 mb-3 p-0 text-center text-sm">Model Roles</h2>
              <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-[auto_1fr]">
                <ModelRoleSelector
                  displayName="Chat"
                  description="Used in the chat interface"
                  models={config.modelsByRole.chat}
                  selectedModel={{
                    title: selectedChatModel,
                    provider: "mock",
                    model: "mock",
                  }}
                  onSelect={(model) => handleChatModelSelection(model)}
                />
                <ModelRoleSelector
                  displayName="Autocomplete"
                  description="Used to generate code completion suggestions"
                  models={config.modelsByRole.autocomplete}
                  selectedModel={config.selectedModelByRole.autocomplete}
                  onSelect={(model) => handleRoleUpdate("autocomplete", model)}
                />
                {/* Jetbrains has a model selector inline */}
                {!jetbrains && (
                  <ModelRoleSelector
                    displayName="Edit"
                    description="Used for inline edits"
                    models={config.modelsByRole.edit}
                    selectedModel={config.selectedModelByRole.edit}
                    onSelect={(model) => handleRoleUpdate("edit", model)}
                  />
                )}
                <ModelRoleSelector
                  displayName="Apply"
                  description="Used to apply generated codeblocks to files"
                  models={config.modelsByRole.apply}
                  selectedModel={config.selectedModelByRole.apply}
                  onSelect={(model) => handleRoleUpdate("apply", model)}
                />
                <ModelRoleSelector
                  displayName="Embed"
                  description="Used to generate and query embeddings for the @codebase and @docs context providers"
                  models={config.modelsByRole.embed}
                  selectedModel={config.selectedModelByRole.embed}
                  onSelect={(model) => handleRoleUpdate("embed", model)}
                />
                <ModelRoleSelector
                  displayName="Rerank"
                  description="Used for reranking results from the @codebase and @docs context providers"
                  models={config.modelsByRole.rerank}
                  selectedModel={config.selectedModelByRole.rerank}
                  onSelect={(model) => handleRoleUpdate("rerank", model)}
                />
              </div>
            </div>
          </div>
        </div>
        {!controlServerBetaEnabled || hubEnabled ? (
          <div className="flex flex-col">
            <div className="flex max-w-[400px] flex-col">
              <div className="flex flex-col gap-4 py-6">
                <div>
                  <h2 className="mb-2 mt-0">User settings</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <ToggleSwitch
                    isToggled={showSessionTabs}
                    onToggle={() =>
                      handleUpdate({
                        showSessionTabs: !showSessionTabs,
                      })
                    }
                    text="Show Session Tabs"
                  />
                  <ToggleSwitch
                    isToggled={codeWrap}
                    onToggle={() =>
                      handleUpdate({
                        codeWrap: !codeWrap,
                      })
                    }
                    text="Wrap Codeblocks"
                  />
                  <ToggleSwitch
                    isToggled={displayRawMarkdown}
                    onToggle={() =>
                      handleUpdate({
                        displayRawMarkdown: !displayRawMarkdown,
                      })
                    }
                    text="Display Raw Markdown"
                  />
                  <ToggleSwitch
                    isToggled={allowAnonymousTelemetry}
                    onToggle={() =>
                      handleUpdate({
                        allowAnonymousTelemetry: !allowAnonymousTelemetry,
                      })
                    }
                    text="Allow Anonymous Telemetry"
                  />
                  <ToggleSwitch
                    isToggled={disableIndexing}
                    onToggle={() =>
                      handleUpdate({
                        disableIndexing: !disableIndexing,
                      })
                    }
                    text="Disable Indexing"
                  />

                  <ToggleSwitch
                    isToggled={disableSessionTitles}
                    onToggle={() =>
                      handleUpdate({
                        disableSessionTitles: !disableSessionTitles,
                      })
                    }
                    text="Disable Session Titles"
                  />
                  <ToggleSwitch
                    isToggled={readResponseTTS}
                    onToggle={() =>
                      handleUpdate({
                        readResponseTTS: !readResponseTTS,
                      })
                    }
                    text="Response Text to Speech"
                  />

                  <ToggleSwitch
                    isToggled={showChatScrollbar}
                    onToggle={() =>
                      handleUpdate({
                        showChatScrollbar: !showChatScrollbar,
                      })
                    }
                    text="Show Chat Scrollbar"
                  />

                  <ToggleSwitch
                    isToggled={useAutocompleteCache}
                    onToggle={() =>
                      handleUpdate({
                        useAutocompleteCache: !useAutocompleteCache,
                      })
                    }
                    text="Use Autocomplete Cache"
                  />

                  <ToggleSwitch
                    isToggled={useChromiumForDocsCrawling}
                    onToggle={() =>
                      handleUpdate({
                        useChromiumForDocsCrawling: !useChromiumForDocsCrawling,
                      })
                    }
                    text="Use Chromium for Docs Crawling"
                  />

                  <label className="flex items-center justify-between gap-3">
                    <span className="lines lines-1 text-left">
                      Codeblock Actions Position
                    </span>
                    <Select
                      value={codeBlockToolbarPosition}
                      onChange={(e) =>
                        handleUpdate({
                          codeBlockToolbarPosition: e.target.value as
                            | "top"
                            | "bottom",
                        })
                      }
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                    </Select>
                  </label>

                  <label className="flex items-center justify-between gap-3">
                    <span className="lines lines-1 text-left">
                      Multiline Autocompletions
                    </span>
                    <Select
                      value={useAutocompleteMultilineCompletions}
                      onChange={(e) =>
                        handleUpdate({
                          useAutocompleteMultilineCompletions: e.target
                            .value as "auto" | "always" | "never",
                        })
                      }
                    >
                      <option value="auto">Auto</option>
                      <option value="always">Always</option>
                      <option value="never">Never</option>
                    </Select>
                  </label>

                  <label className="flex items-center justify-between gap-3">
                    <span className="text-left">Font Size</span>
                    <NumberInput
                      value={fontSize}
                      onChange={(val) =>
                        handleUpdate({
                          fontSize: val,
                        })
                      }
                      min={7}
                      max={50}
                    />
                  </label>

                  <form
                    className="flex flex-col gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmitPromptPath();
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>Workspace prompts path</span>
                      <div className="flex items-center gap-2">
                        <Input
                          value={formPromptPath}
                          className="max-w-[100px]"
                          onChange={(e) => {
                            setFormPromptPath(e.target.value);
                          }}
                        />
                        <div className="flex h-full flex-col">
                          {formPromptPath !== promptPath ? (
                            <>
                              <div
                                onClick={handleSubmitPromptPath}
                                className="cursor-pointer"
                              >
                                <CheckIcon className="h-4 w-4 text-green-500 hover:opacity-80" />
                              </div>
                              <div
                                onClick={cancelChangePromptPath}
                                className="cursor-pointer"
                              >
                                <XMarkIcon className="h-4 w-4 text-red-500 hover:opacity-80" />
                              </div>
                            </>
                          ) : (
                            <div>
                              <CheckIcon className="text-vsc-foreground-muted h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                  <form
                    className="flex flex-col gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleDisableAutocompleteSubmit();
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>Disable autocomplete in files</span>
                      <div className="flex items-center gap-2">
                        <Input
                          value={formDisableAutocomplete}
                          className="max-w-[100px]"
                          onChange={(e) => {
                            setFormDisableAutocomplete(e.target.value);
                          }}
                        />
                        <div className="flex h-full flex-col">
                          {formDisableAutocomplete !==
                          disableAutocompleteInFiles ? (
                            <>
                              <div
                                onClick={handleDisableAutocompleteSubmit}
                                className="cursor-pointer"
                              >
                                <CheckIcon className="h-4 w-4 text-green-500 hover:opacity-80" />
                              </div>
                              <div
                                onClick={cancelChangeDisableAutocomplete}
                                className="cursor-pointer"
                              >
                                <XMarkIcon className="h-4 w-4 text-red-500 hover:opacity-80" />
                              </div>
                            </>
                          ) : (
                            <div>
                              <CheckIcon className="text-vsc-foreground-muted h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-vsc-foreground-muted text-lightgray self-end text-xs">
                      Comma-separated list of path matchers
                    </span>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ConfigPage;
