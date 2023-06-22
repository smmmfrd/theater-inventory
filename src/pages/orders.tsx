import { type TicketOrder } from "@prisma/client";
import { api } from "~/utils/api";

export default function OrdersPage() {
  const query = api.ticketOrders.getAllOrders.useQuery();

  if (query.isLoading) {
    return <div>Loading</div>;
  }

  return (
    <>
      <header>
        <h2>Ticket Orders</h2>
      </header>

      <section>
        {query.data?.orders && <OrdersDisplay orders={query.data.orders} />}
      </section>
    </>
  );
}

type OrdersDisplayType = {
  orders: TicketOrder[];
};

function OrdersDisplay({ orders }: OrdersDisplayType) {
  return <div className="flex flex-wrap gap-2">{orders.map(OrderCard)}</div>;
}

function OrderCard(order: TicketOrder) {
  return (
    <div className="rounded border-4 border-primary bg-primary">
      {order.name}
    </div>
  );
}
