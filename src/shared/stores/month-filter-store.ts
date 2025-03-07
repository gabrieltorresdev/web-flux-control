import { create } from "zustand";
import { persist } from "zustand/middleware";

// Interface para o estado do filtro de mês
interface MonthFilterState {
  // Estado
  month: number;
  year: number;
  
  // Métodos para alterar o estado
  setDate: (month: number, year: number) => void;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  resetToCurrentMonth: () => void;
  
  // Métodos para obter dados formatados
  getAsQueryParams: () => { month: string; year: string };
  getFormattedMonth: () => string;
}

// Obtendo o mês e ano atual para valores iniciais
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1; // JavaScript months são 0-indexed
const currentYear = currentDate.getFullYear();

export const useMonthFilterStore = create<MonthFilterState>()(
  persist(
    (set, get) => ({
      month: currentMonth,
      year: currentYear,
      
      setDate: (month, year) => set({ month, year }),
      
      setMonth: (month) => set({ month }),
      
      setYear: (year) => set({ year }),
      
      goToPreviousMonth: () => {
        const { month, year } = get();
        if (month === 1) {
          set({ month: 12, year: year - 1 });
        } else {
          set({ month: month - 1 });
        }
      },
      
      goToNextMonth: () => {
        const { month, year } = get();
        if (month === 12) {
          set({ month: 1, year: year + 1 });
        } else {
          set({ month: month + 1 });
        }
      },
      
      resetToCurrentMonth: () => {
        set({ month: currentMonth, year: currentYear });
      },
      
      getAsQueryParams: () => {
        const { month, year } = get();
        return {
          month: month.toString(),
          year: year.toString()
        };
      },
      
      getFormattedMonth: () => {
        const { month, year } = get();
        const date = new Date(year, month - 1);
        
        return new Intl.DateTimeFormat('pt-BR', {
          month: 'long',
          year: 'numeric'
        }).format(date);
      },
    }),
    {
      name: "month-filter-store",
    }
  )
); 