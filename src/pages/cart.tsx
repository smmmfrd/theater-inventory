import React, { useEffect, useState } from "react";
import { useTicketStore } from "~/store/TicketStore";
import { api } from "~/utils/api";

export default function CartPage() {
  const createTicketOrder = api.ticketOrders.createOrder.useMutation();
  const { cartTicketOrders } = useTicketStore();

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
    let formErrors = {
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
  }, [formData, errors, isSubmitted]);

  return (
    <>
      <header className="px-8">
        <h2 className="mt-8 text-4xl font-bold underline">Cart</h2>
      </header>
      <section className="px-8">
        <table className="mx-auto table w-max border-separate bg-primary font-mono">
          <thead>
            <tr className="text-lg text-neutral-focus [&>*]:pb-0 [&>*]:font-thin">
              <th>Tickets</th>
              <th>Movie</th>
              <th>Showtime</th>
            </tr>
          </thead>
          <tbody>
            {cartTicketOrders.map((ticketOrder) => (
              <tr className="text-2xl">
                <th className="text-right">{ticketOrder.number}</th>
                <th>{ticketOrder.movieTitle}</th>
                <th>{ticketOrder.showtime}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="px-8">
        <h3 className="mb-4 text-2xl font-bold">"Purchase" Tickets</h3>

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
          <p className="pl-4 text-sm text-error">Please enter a valid name.</p>
        )}

        {createTicketOrder.isSuccess && <p>Order Placed!</p>}
      </section>
    </>
  );
}
