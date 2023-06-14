import { create } from "zustand";

type CartTicketOrder = {
  number: number;
  showtime: string;
  movieTitle: string;
  showtimeId: number;
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
