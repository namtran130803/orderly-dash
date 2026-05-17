import { create } from 'zustand';

interface StoreContextState {
  selectedStoreId: number | null;
  setSelectedStoreId: (id: number) => void;
  clearSelectedStoreId: () => void;
  selectedStoreName: string | null;
  setSelectedStoreName: (name: string) => void;
  clearSelectedStoreName: () => void;
  selectedUserId: number | null;
  setSelectedUserId: (id: number) => void;
  clearSelectedUserId: () => void;
  selectedUserName: string | null;
  setSelectedUserName: (name: string) => void;
  clearSelectedUserName: () => void;
}

export const useStoreContext = create<StoreContextState>()(
  (set) => ({
    selectedStoreId: null,
    setSelectedStoreId: (id) => set({ selectedStoreId: id }),
    clearSelectedStoreId: () => set({ selectedStoreId: null }),
    selectedStoreName: null,
    setSelectedStoreName: (name) => set({ selectedStoreName: name }),
    clearSelectedStoreName: () => set({ selectedStoreName: null }),
    selectedUserId: null,
    setSelectedUserId: (id) => set({ selectedUserId: id }),
    clearSelectedUserId: () => set({ selectedUserId: null }),
    selectedUserName: null,
    setSelectedUserName: (name) => set({ selectedUserName: name }),
    clearSelectedUserName: () => set({ selectedUserName: null }),
  })
);
