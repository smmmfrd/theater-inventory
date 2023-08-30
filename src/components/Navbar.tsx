import Link from "next/link";
import { useTicketStore } from "~/store/TicketStore";

export default function Navbar() {
  const { cartTicketOrders } = useTicketStore();

  return (
    <nav className="sticky top-0 z-10 -mb-5 h-14 bg-primary px-4 py-3 text-neutral">
      <div className="mx-auto flex max-w-3xl items-end justify-between">
        <Link href="/" className="link no-underline hover:underline">
          <h1 className="text-2xl">Fake Theater</h1>
        </Link>
        <ul className="flex gap-4">
          <li>
            <Link
              href="/orders"
              className="link no-underline hover:underline"
              title="View and delete all orders by showtime"
            >
              <h2 className="">Orders</h2>
            </Link>
          </li>
          <li>
            <Link href="/about" className="link no-underline hover:underline">
              <h2 className="">About</h2>
            </Link>
          </li>
          <li>
            <Link href="/cart" className="link no-underline hover:underline">
              <h2 className="">
                Cart{" "}
                {cartTicketOrders.length > 0 && `(${cartTicketOrders.length})`}
              </h2>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
