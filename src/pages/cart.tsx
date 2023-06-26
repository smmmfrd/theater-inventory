import Link from "next/link";
import React, { useEffect, useState } from "react";
import { type CartTicketOrder, useTicketStore } from "~/store/TicketStore";
import { api } from "~/utils/api";

export default function CartPage() {
  const createTicketOrder = api.ticketOrders.createOrder.useMutation();
  const { cartTicketOrders, deleteOrder } = useTicketStore();

  const [formData, setFormData] = useState({
    name: "",
  });

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const [errors, setErrors] = useState({
    name: false,
  });

  const validate = (form: typeof formData) => {
    const formErrors = {
      name: false,
    };
    if (form.name.length < 2) {
      formErrors.name = true;
    }

    return formErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors(validate(formData));
    setIsSubmitted(true);
  };

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isSubmitted) return;

    // Make sure each value is false
    if (
      Object.keys(errors).every((key) => !errors[key as keyof typeof errors])
    ) {
      createTicketOrder.mutate({
        name: formData.name,
        orders: cartTicketOrders.map((order) => ({
          movieTitle: order.movieTitle,
          number: order.number,
          showtimeId: order.showtimeId,
        })),
      });
    }
    setIsSubmitted(false);
  }, [formData, errors, isSubmitted, cartTicketOrders, createTicketOrder]);

  const TicketRow = (ticketOrder: CartTicketOrder) => (
    <tr
      className="text-2xl"
      key={`${ticketOrder.showtimeId}${ticketOrder.number}`}
    >
      <td className="">{ticketOrder.number}</td>
      <td>{ticketOrder.movieTitle}</td>
      <td>{ticketOrder.showtime}</td>
      <td className="w- relative">
        <button
          className="btn-outline btn-xs btn-circle btn absolute left-0 top-4 border-2"
          title="Delete Order"
          onClick={() => deleteOrder(ticketOrder.showtimeId)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </td>
    </tr>
  );

  return (
    <>
      <header className="px-8">
        <h2 className="mt-8 text-4xl font-bold underline">
          Your Cart {cartTicketOrders.length === 0 && "Is Empty!"}
        </h2>
        {cartTicketOrders.length === 0 && (
          <Link href="/" className="btn-primary btn mx-auto mt-12">
            Select a Movie & Showtime
          </Link>
        )}
      </header>
      {cartTicketOrders.length > 0 && (
        <>
          <section className="px-8">
            <table className="mx-auto table w-max border-separate bg-primary text-right font-mono">
              <thead>
                <tr className="text-lg text-neutral-focus [&>*]:pb-0 [&>*]:font-thin">
                  <th>Tickets</th>
                  <th>Movie</th>
                  <th>Showtime</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{cartTicketOrders.map(TicketRow)}</tbody>
            </table>
          </section>
          <section className="px-8">
            <h3 className="mb-4 text-2xl font-bold">
              &quot;Purchase&quot; Tickets
            </h3>

            <form onSubmit={handleSubmit} className="join">
              <input
                type="text"
                name="name"
                className="input join-item"
                placeholder="Name here..."
                onChange={handleChange}
              />
              <button type="submit" className="btn-outline join-item btn">
                Place Order
              </button>
            </form>

            {errors.name && (
              <p className="pl-4 text-sm text-error">
                Please enter a valid name.
              </p>
            )}

            {createTicketOrder.isSuccess && <p>Order Placed!</p>}
          </section>
        </>
      )}
    </>
  );
}
