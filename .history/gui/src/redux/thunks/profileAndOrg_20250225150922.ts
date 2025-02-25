import { createAsyncThunk } from "@reduxjs/toolkit";
import { ProfileDescription } from "core/config/ConfigHandler";
import { OrganizationDescription } from "core/config/ProfileLifecycleManager";
import {
  setAvailableProfiles,
  setOrganizations,
  setSelectedOrganizationId,
  setSelectedProfile,
} from "../slices/sessionSlice";
import { ThunkApiType } from "../store";
import { setPersonna } from "../slices/configSlice";
import { addMessageTemplate, updateMessageTemplate, deleteMessageTemplate } from '../slices/configSlice';
import { MessageTemplate } from "../slices/configSlice";

const TEMPLATES_STORAGE_KEY = 'continue_message_templates';

export const selectProfileThunk = createAsyncThunk<
  void,
  string | null,
  ThunkApiType
>("profiles/select", async (id, { dispatch, extra, getState }) => {
  const state = getState();

  if (state.session.availableProfiles === null) {
    // Currently in loading state
    return;
  }

  const initialId = state.session.selectedProfile?.id;

  let newId = id;

  console.log(
    "Running Thunk: ",
    initialId,
    newId,
    state.session.availableProfiles,
  );
  // If no profiles, force clear
  if (state.session.availableProfiles.length === 0) {
    newId = null;
  } else {
    // If new id doesn't match an existing profile, clear it
    if (newId) {
      if (!state.session.availableProfiles.find((p) => p.id === newId)) {
        newId = null;
      }
    }
    if (!newId) {
      // At this point if null ID and there ARE profiles,
      // Fallback to a profile, prioritizing the first in the list
      newId = state.session.availableProfiles[0].id;
    }
  }

  // Only update if there's a change
  console.log(
    "update selected profile?",
    newId,
    initialId,
    state.session.availableProfiles,
  );
  if ((newId ?? null) !== (initialId ?? null)) {
    dispatch(
      setSelectedProfile(
        state.session.availableProfiles.find((p) => p.id === newId) ?? null,
      ),
    );
    extra.ideMessenger.post("didChangeSelectedProfile", {
      id: newId,
    });
  }
});




export const cycleProfile = createAsyncThunk<void, undefined, ThunkApiType>(
  "profiles/cycle",
  async (_, { dispatch, getState }) => {
    const state = getState();

    if (state.session.availableProfiles === null) {
      return;
    }

    const profileIds = state.session.availableProfiles.map(
      (profile) => profile.id,
    );
    // In case of no profiles just does nothing
    if (profileIds.length === 0) {
      return;
    }
    let nextId = profileIds[0];
    if (state.session.selectedProfile) {
      const curIndex = profileIds.indexOf(state.session.selectedProfile?.id);
      const nextIndex = (curIndex + 1) % profileIds.length;
      nextId = profileIds[nextIndex];
    }
    await dispatch(selectProfileThunk(nextId));
  },
);

export const updateProfilesThunk = createAsyncThunk<
  void,
  { profiles: ProfileDescription[] | null; selectedProfileId: string | null },
  ThunkApiType
>("profiles/update", async (data, { dispatch, extra, getState }) => {
  const { profiles, selectedProfileId } = data;

  dispatch(setAvailableProfiles(profiles));

  // This will trigger reselection if needed
  console.log("selecting 3", selectedProfileId);
  dispatch(selectProfileThunk(selectedProfileId));
});

export const selectOrgThunk = createAsyncThunk<
  void,
  string | null,
  ThunkApiType
>("session/selectOrg", async (id, { dispatch, extra, getState }) => {
  const state = getState();
  const initialId = state.session.selectedOrganizationId;
  let newId = id;

  // If no orgs, force clear
  if (state.session.organizations.length === 0) {
    newId = null;
  } else if (newId) {
    // If new id doesn't match an existing org, clear it
    if (!state.session.organizations.find((o) => o.id === newId)) {
      newId = null;
    }
  }
  // Unlike profiles, don't fallback to the first org,
  // Fallback to Personal (org = null)

  if (initialId !== newId) {
    dispatch(setAvailableProfiles(null));
    dispatch(setSelectedOrganizationId(newId));
    extra.ideMessenger.post("didChangeSelectedOrg", {
      id: newId,
    });
  }
});

export const updateOrgsThunk = createAsyncThunk<
  void,
  OrganizationDescription[],
  ThunkApiType
>("session/updateOrgs", async (orgs, { dispatch, getState }) => {
  const state = getState();
  dispatch(setOrganizations(orgs));

  // This will trigger reselection if needed
  dispatch(selectOrgThunk(state.session.selectedOrganizationId));
});



export const updatePersonnaThunk = createAsyncThunk<
  void,
  string | null,
  ThunkApiType
>("profiles/updatePersonna", async (personna: string | null, { dispatch }) => {

    dispatch(setPersonna(personna));  
  })

  // Thunk pour charger les templates depuis le localStorage
export const loadMessageTemplates = createAsyncThunk(
  'config/loadMessageTemplates',
  async (_, { dispatch }) => {
    try {
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        const templates = JSON.parse(storedTemplates) as MessageTemplate[];
        templates.forEach(template => dispatch(addMessageTemplate(template)));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des templates depuis le localStorage:", error);
      // Gérer l'erreur (par exemple, afficher un message à l'utilisateur)
    }
  }
);


// Thunk pour ajouter un template et sauvegarder dans le localStorage
export const addMessageTemplateAndSave = createAsyncThunk(
  'config/addMessageTemplateAndSave',
  async ({ title, content }: { title: string; content: string }, { dispatch, getState }) => {
    dispatch(addMessageTemplate({ title, content }));
    const state = getState() as RootState;
    saveTemplatesToLocalStorage(state.config.messageTemplates);
  }
);

// Thunk pour mettre à jour un template et sauvegarder dans le localStorage
export const updateMessageTemplateAndSave = createAsyncThunk(
  'config/updateMessageTemplateAndSave',
  async (template: MessageTemplate, { dispatch, getState }) => {
    dispatch(updateMessageTemplate(template));
    const state = getState() as RootState;
    saveTemplatesToLocalStorage(state.config.messageTemplates);
  }
);

// Thunk pour supprimer un template et sauvegarder dans le localStorage
export const deleteMessageTemplateAndSave = createAsyncThunk(
  'config/deleteMessageTemplateAndSave',
  async (templateId: string, { dispatch, getState }) => {
    dispatch(deleteMessageTemplate(templateId));
    const state = getState() as RootState;
    saveTemplatesToLocalStorage(state.config.messageTemplates);
  }
);

// Fonction utilitaire pour sauvegarder les templates dans le localStorage
const saveTemplatesToLocalStorage = (templates: MessageTemplate[]) => {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des templates dans le localStorage:", error);
    // Gérer l'erreur
  }
};