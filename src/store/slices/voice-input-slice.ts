import { StateCreator } from "zustand";

export interface VoiceInputState {
  transcript: string;
  editedValue: string | null;
  isEditing: boolean;
}

export interface VoiceInputActions {
  setTranscript: (value: string) => void;
  setEditedValue: (value: string) => void;
  startEditing: () => void;
  stopEditing: () => void;
  reset: () => void;
}

export type VoiceInputSlice = VoiceInputState & VoiceInputActions;

export const createVoiceInputSlice: StateCreator<VoiceInputSlice> = (set, get) => ({
  // State
  transcript: "",
  editedValue: null,
  isEditing: false,

  // Actions
  setTranscript: (value) => {
    set((state) => ({
      transcript: value,
      // Only update editedValue if we're not editing or it's null
      editedValue: state.isEditing ? state.editedValue : value,
    }));
  },

  setEditedValue: (value) => {
    set({ editedValue: value });
  },

  startEditing: () => {
    const { transcript, editedValue } = get();
    set({
      isEditing: true,
      editedValue: editedValue ?? transcript,
    });
  },

  stopEditing: () => {
    set((state) => ({
      isEditing: false,
      transcript: state.editedValue ?? state.transcript,
      editedValue: null,
    }));
  },

  reset: () => {
    set({
      transcript: "",
      editedValue: null,
      isEditing: false,
    });
  },
});