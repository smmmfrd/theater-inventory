import Link from "next/link";
import { useTicketStore } from "~/store/TicketStore";

export default function Navbar() {
  const { cartTicketOrders } = useTicketStore();

  return (
    <nav className="sticky top-0 z-10 -mb-5 h-14 bg-primary px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-end justify-between">
        <Link href="/" className="link no-underline hover:underline">
          <h1 className="text-2xl font-thin">Fake Theater</h1>
        </Link>
        <ul className="flex gap-4">
          <li>
            <Link
              href="/orders"
              className="link no-underline hover:underline"
              title="View and delete all orders by showtime"
            >
              <h1 className="font-thin">Orders</h1>
            </Link>
          </li>
          <li>
            <Link href="/about" className="link no-underline hover:underline">
              <h1 className="font-thin">About</h1>
            </Link>
          </li>
          <li>
            <Link href="/cart" className="link no-underline hover:underline">
              <h1 className="font-thin">
                Cart{" "}
                {cartTicketOrders.length > 0 && `(${cartTicketOrders.length})`}
              </h1>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
