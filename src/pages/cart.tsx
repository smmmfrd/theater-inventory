import { useTicketStore } from "~/store/TicketStore";

export default function CartPage() {
  const { cartTicketOrders } = useTicketStore();
  return (
    <>
      <header className="px-8">
        <h2 className="mt-8 text-4xl font-bold underline">Cart</h2>
      </header>
      <section className="px-8">
        <table className="table border-separate border-spacing-0 bg-secondary font-mono">
          <thead>
            <tr className="text-lg text-neutral">
              <th>Ticket #</th>
              <th>Movie</th>
              <th>Showtime</th>
            </tr>
          </thead>
          <tbody>
            {cartTicketOrders.map((ticketOrder) => (
              <tr>
                <th>{ticketOrder.number}</th>
                <th>{ticketOrder.movieTitle}</th>
                <th>{ticketOrder.showtime}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="px-8">
        <h3 className="text-2xl font-bold">Place Order</h3>
      </section>
    </>
  );
}
