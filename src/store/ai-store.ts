import { create } from "zustand";

/**
 * Interface defining the structure of the AI store
 * Contains model configuration and setter function
 */
export interface AiStore {
  // Configuration object for the AI model
  model: {
    apiKey: string; // API key for authentication
    baseUrl: string; // Base URL for API endpoints
    model: string; // Model identifier/name
  };
  // Function to update the model configuration
  setModel: (model: any) => void;
}

/**
 * Zustand store for managing AI model configuration
 * Provides reactive state management for AI-related settings
 */
export const useAiStore = create<AiStore>((set) => ({
  // Initial state with empty/default values
  model: {
    apiKey: "",
    baseUrl: "",
    model: "",
  },
  // State updater function that merges new values with existing state
  setModel: (model: any) => {
    set((state) => ({
      model: {
        ...state.model, // Preserve existing values
        ...model, // Apply new values (shallow merge)
      },
    }));
  },
}));
