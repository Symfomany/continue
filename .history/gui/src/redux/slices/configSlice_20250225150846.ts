import { ConfigResult, ConfigValidationError } from "@continuedev/config-yaml";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BrowserSerializedContinueConfig } from "core";
import { DEFAULT_MAX_TOKENS } from "core/llm/constants";
import { v4 as uuidv4 } from 'uuid'; // Pour générer des IDs uniques

export interface MessageTemplate {
  id: string; // Un identifiant unique pour chaque template
  title: string;
  content: string;
  createdAt: string; // Date de création, stockée comme chaîne ISO
}

export type ConfigState = {
  personna: string | null;
  configError: ConfigValidationError[] | undefined;
  config: BrowserSerializedContinueConfig;
  defaultModelTitle: string;
  messageTemplates: MessageTemplate[]
};



const initialState: ConfigState = {
  configError: undefined,
  defaultModelTitle: "GPT-4",
   messageTemplates: [],
  personna: null,
  config: {
    slashCommands: [
      {
        name: "share",
        description: "Export the current chat session to markdown",
      },
      {
        name: "cmd",
        description: "Generate a shell command",
      },
    ],
    contextProviders: [],
    models: [],
    tools: [],
    usePlatform: true,
  },
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setPersonna: (state, action: PayloadAction<string | null>) => {
      state.personna = action.payload;
    },
    setConfigResult: (
      state,
      {
        payload: result,
      }: PayloadAction<ConfigResult<BrowserSerializedContinueConfig>>,
    ) => {
      const { config, errors } = result;
      state.configError = errors;

      if (!config) {
        return;
      }

      const defaultModelTitle =
        config.models.find((model) => model.title === state.defaultModelTitle)
          ?.title ||
        config.models[0]?.title ||
        "";
      state.config = config;
      state.defaultModelTitle = defaultModelTitle;
    },

    addMessageTemplate: (state, action: PayloadAction<{ title: string; content: string }>) => {
      const newTemplate: MessageTemplate = {
        id: uuidv4(),
        title: action.payload.title,
        content: action.payload.content,
        createdAt: new Date().toISOString(), // Date actuelle au format ISO
      };
      state.messageTemplates.push(newTemplate);
    },
    updateMessageTemplate: (state, action: PayloadAction<MessageTemplate>) => {
      const index = state.messageTemplates.findIndex(template => template.id === action.payload.id);
      if (index !== -1) {
        state.messageTemplates[index] = action.payload;
      }
    },
    deleteMessageTemplate: (state, action: PayloadAction<string>) => {
      state.messageTemplates = state.messageTemplates.filter(template => template.id !== action.payload);
    },

    updateConfig: (
      state,
      { payload: config }: PayloadAction<BrowserSerializedContinueConfig>,
    ) => {
      state.config = config;
    },
    setConfigError: (
      state,
      { payload: error }: PayloadAction<ConfigValidationError[] | undefined>,
    ) => {
      state.configError = error;
    },
    setDefaultModel: (
      state,
      { payload }: PayloadAction<{ title: string; force?: boolean }>,
    ) => {
      const model = state.config.models.find(
        (model) => model.title === payload.title,
      );
      if (!model && !payload.force) return;
      return {
        ...state,
        defaultModelTitle: payload.title,
      };
    },
    cycleDefaultModel: (state, { payload }: PayloadAction<"next" | "prev">) => {
      const currentIndex = state.config.models.findIndex(
        (model) => model.title === state.defaultModelTitle,
      );
      const nextIndex =
        (currentIndex +
          (payload === "next" ? 1 : -1) +
          state.config.models.length) %
        state.config.models.length;
      return {
        ...state,
        defaultModelTitle: state.config.models[nextIndex].title,
      };
    },
  },
  selectors: {
    selectDefaultModel: (state) => {
      return state.config.models.find(
        (model) => model.title === state.defaultModelTitle,
      );
    },
    selectDefaultModelContextLength: (state): number => {
      return (
        configSlice.getSelectors().selectDefaultModel(state)?.contextLength ||
        DEFAULT_MAX_TOKENS
      );
    },
    selectUIConfig: (state) => {
      return state.config?.ui ?? null;
    },
  },
});

export const {
  setDefaultModel,
  cycleDefaultModel,
  updateConfig,
  setConfigResult,
  setConfigError,
  setPersonna,
  addMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
} = configSlice.actions;

export const {
  selectDefaultModel,
  selectDefaultModelContextLength,
  selectUIConfig,
} = configSlice.selectors;

export default configSlice.reducer;
