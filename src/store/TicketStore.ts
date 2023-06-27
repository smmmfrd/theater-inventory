import { create } from "zustand";

export type CartTicketOrder = {
  number: number;
  showtime: string;
  movieTitle: string;
  showtimeId: number;
  movieId: number;
};

interface TicketState {
  cartTicketOrders: CartTicketOrder[];
}

interface TicketActions {
  addTicket: (newTicketOrder: CartTicketOrder) => void;
  deleteOrder: (showtimeId: number) => void;
  clearOrders: (except: number[]) => void;
}

export const useTicketStore = create<TicketState & TicketActions>((set) => ({
  cartTicketOrders: [],
  addTicket: (newTicketOrder) =>
    set((state) => {
      // Check if the user is adding more tickets to the same showing
      if (
        state.cartTicketOrders.some(
          (order) => order.showtimeId === newTicketOrder.showtimeId
        )
      ) {
        return {
          cartTicketOrders: state.cartTicketOrders.map((order) => ({
            ...order,
            number:
              order.showtimeId === newTicketOrder.showtimeId
                ? order.number + newTicketOrder.number
                : order.number,
          })),
        };
      }

      return {
        cartTicketOrders: [...state.cartTicketOrders, newTicketOrder],
      };
    }),
  deleteOrder: (showtimeId) => {
    set((state) => ({
      cartTicketOrders: state.cartTicketOrders.filter(
        (order) => order.showtimeId !== showtimeId
      ),
    }));
  },
  clearOrders: (except: number[]) => {
    set((state) => ({
      cartTicketOrders: except.map(
        (id) => state.cartTicketOrders.find((order) => order.showtimeId === id)!
      ),
    }));
  },
}));
