"use client";

import { create } from "zustand";
import { createTransactionSlice, TransactionSlice } from "./slices/transaction-slice";
import { createVoiceInputSlice, VoiceInputSlice } from "./slices/voice-input-slice";

export type StoreState = TransactionSlice & VoiceInputSlice;

export const useStore = create<StoreState>()((...args) => ({
  ...createTransactionSlice(...args),
  ...createVoiceInputSlice(...args),
}));