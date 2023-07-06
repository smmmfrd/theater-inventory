import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { type CartTicketOrder, useTicketStore } from "~/store/TicketStore";
import { api } from "~/utils/api";

export default function CartPage() {
  const { cartTicketOrders, deleteOrder, clearOrders } = useTicketStore();
  const { mutate, isLoading, isSuccess } =
    api.ticketOrders.createOrder.useMutation({
      onSuccess: (data) => {
        setErrors((prev) => ({ ...prev, badShowtimeIds: data }));
        clearOrders(data);
      },
    });

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
    badShowtimeIds: [] as number[],
  });

  const validate = (form: typeof formData) => {
    const formErrors = {
      ...errors,
      name: false,
    };
    if (form.name.length < 2) {
      formErrors.name = true;
    }

    return formErrors;
  };

  const noErrors = () => {
    return errors.name === false && errors.badShowtimeIds.length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors(validate(formData));
    setIsSubmitted(true);
  };

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isSubmitted) return;

    // Make sure each value in errors is false
    if (noErrors()) {
      mutate({
        name: formData.name,
        orders: cartTicketOrders.map((order) => ({
          movieTitle: order.movieTitle,
          number: order.number,
          showtimeId: order.showtimeId,
        })),
      });
    } else {
      // TODO - right proper fix here bucko
      console.log("there's errors sicko.");
    }
    setIsSubmitted(false);
  }, [formData, errors, isSubmitted, cartTicketOrders, mutate]);

  // When the user changes what page they're on, we need to clear the bad orders.
  const router = useRouter();

  useEffect(() => {
    const handleRouterChange = () => {
      if (errors.badShowtimeIds.length > 0) {
        clearOrders([]);
      }
    };
    router.events.on("routeChangeStart", handleRouterChange);

    return () => {
      router.events.off("routeChangeStart", handleRouterChange);
    };
  }, [errors, router, clearOrders]);

  const TicketRow = (ticketOrder: CartTicketOrder) => (
    <tr
      className="text-xl [&>*]:py-2.5"
      key={`${ticketOrder.showtimeId}${ticketOrder.number}`}
    >
      <td className="">{ticketOrder.number}</td>
      <td>{ticketOrder.movieTitle}</td>
      <td>{ticketOrder.showtime}</td>
      <td className="relative">
        <button
          className="btn-outline btn-xs btn-circle btn absolute left-0 top-3 border-2"
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
      {errors.badShowtimeIds.length > 0 && (
        <td className="">
          {errors.badShowtimeIds.find(
            (id) => id === ticketOrder.showtimeId
          ) && (
            <Link
              className="btn-error btn-square btn-xs flex items-center justify-center rounded-lg text-base-100"
              title="Go back to this showtime"
              href={`/movies/${ticketOrder.movieId}/${ticketOrder.showtimeId}`}
            >
              !
            </Link>
          )}
        </td>
      )}
    </tr>
  );

  return (
    <>
      <header className="px-8">
        <h2 className="mt-8 text-4xl font-bold underline">
          {`${
            isSuccess
              ? errors.badShowtimeIds.length > 0
                ? "Your order was placed, but there were issues!"
                : "Your order was placed!"
              : `Your Cart ${cartTicketOrders.length > 0 ? "" : "Is Empty!"}`
          }`}
        </h2>

        {cartTicketOrders.length === 0 && (
          <Link href="/" className="btn-primary btn mx-auto mt-12">
            Select {isSuccess ? "another" : "a"} Movie & Showtime
          </Link>
        )}
      </header>
      {cartTicketOrders.length > 0 && (
        <>
          <section className="mx-8">
            <table className="mx-auto table max-w-2xl text-right font-mono">
              <thead>
                <tr className="border-b-2 border-accent bg-base-300 text-lg text-neutral-focus [&>*]:py-2 [&>*]:font-bold">
                  <th>#</th>
                  <th>Movie</th>
                  <th>Showtime</th>
                  <th></th>
                  {errors.badShowtimeIds.length > 0 && <th></th>}
                </tr>
              </thead>
              <tbody className="last:border-none odd:border-b-2 even:border-b-2 [&>*]:border-accent-content">
                {cartTicketOrders.map(TicketRow)}
              </tbody>
            </table>
          </section>

          <section className="mx-auto w-full max-w-2xl px-8">
            {isLoading ? (
              <div className="loading-xl loading loading-spinner mx-auto text-base-100"></div>
            ) : errors.badShowtimeIds.length === 0 ? (
              <>
                <h3 className="mb-4 text-2xl font-bold">
                  &quot;Purchase&quot; Tickets
                </h3>

                <div className="divider"></div>

                <section>
                  <h4 className="mb-2 flex justify-between px-4 text-xl font-semibold italic">
                    Total -{" "}
                    <span>
                      {`${cartTicketOrders.reduce(
                        (acc, order) => acc + order.number * order.ticketPrice,
                        0
                      )}$`}
                    </span>
                  </h4>

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
                </section>
              </>
            ) : (
              <>
                <p>
                  The number of available seats changed while your order was
                  processing. All other orders were successful.
                </p>
                <p>
                  Click the error to go back to the showtime or remove the order
                  from your cart.
                </p>
                <p>
                  If you leave this page all erroneous orders will be cleared.
                </p>
              </>
            )}
          </section>
        </>
      )}
    </>
  );
}
