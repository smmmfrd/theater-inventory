import { create } from "zustand";

type CartTicketOrder = {
  number: number;
  showtimeId: number;
  movieTitle: string;
};

interface TicketState {
  cartTicketOrders: CartTicketOrder[];
}

interface TicketActions {
  addTicket: (newTicketOrder: CartTicketOrder) => void;
}

export const useTicketStore = create<TicketState & TicketActions>((set) => ({
  cartTicketOrders: [],
  addTicket: (newTicketOrder) =>
    set((state) => ({
      cartTicketOrders: [...state.cartTicketOrders, newTicketOrder],
    })),
}));
