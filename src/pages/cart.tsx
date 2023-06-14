import { useTicketStore } from "~/store/TicketStore";

export default function CartPage() {
  const { cartTicketOrders } = useTicketStore();
  return (
    <div>
      <h2>order up!</h2>
      {JSON.stringify(cartTicketOrders)}
    </div>
  );
}
