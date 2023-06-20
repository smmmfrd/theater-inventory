import { api } from "~/utils/api";

export default function OrdersPage() {
  const query = api.ticketOrders.getAllOrders.useQuery();

  if (query.isLoading) {
    return <div>Loading</div>;
  }

  return <div>There are: {query.data?.orders.length} orders</div>;
}
