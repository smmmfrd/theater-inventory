import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { type CartTicketOrder, useTicketStore } from "~/store/TicketStore";
import { api } from "~/utils/api";
import RegularLayout from "~/components/RegularLayout";
import Head from "next/head";

export default function CartPage() {
  const { cartTicketOrders, deleteOrder, clearOrders, updateOrder } =
    useTicketStore();

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

  const errorId = (showtimeId: number): boolean =>
    errors.badShowtimeIds.length > 0 &&
    errors.badShowtimeIds.some((id) => id === showtimeId);

  const TicketRow = (ticketOrder: CartTicketOrder, index: number) => (
    <tr
      className={`text-xl [&>*]:py-2.5 ${
        index !== cartTicketOrders.length - 1 &&
        "border-b-2 border-accent-content"
      }`}
      key={`${ticketOrder.showtimeId}${ticketOrder.number}`}
    >
      <td className="overflow-hidden px-0">
        <input
          type="number"
          value={ticketOrder.number}
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            updateOrder(ticketOrder.showtimeId, parseInt(e.currentTarget.value))
          }
          className="input -ml-1 w-20 rounded-l-none border-l-0 pr-4 text-right text-2xl"
          min={1}
          onKeyDown={(e) => e.preventDefault()}
          max={ticketOrder.availableSeats}
        />
      </td>
      <td>
        <Link
          className="link"
          title="Go to this movie's page"
          href={`/movies/${ticketOrder.movieId}`}
        >
          {ticketOrder.movieTitle}
        </Link>
      </td>
      <td>
        <Link
          className="link"
          title="Go to this showtime's page"
          href={`/movies/${ticketOrder.movieId}/${ticketOrder.showtimeId}`}
        >
          {ticketOrder.showtime}
        </Link>
      </td>
      <td className="relative">
        <button
          className="btn-outline btn-xs btn-circle btn absolute left-0 top-[22px] overflow-hidden border-2"
          title="Delete Order"
          onClick={() => deleteOrder(ticketOrder.showtimeId)}
        >
          {errorId(ticketOrder.showtimeId) ? (
            <Link
              className="btn-error btn-square btn-xs flex items-center justify-center rounded-lg text-base-100"
              title="Go back to this showtime"
              href={`/movies/${ticketOrder.movieId}/${ticketOrder.showtimeId}`}
            >
              !
            </Link>
          ) : (
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
          )}
        </button>
      </td>
    </tr>
  );

  return (
    <>
      <Head>
        <title>Your Cart | Fake Theater</title>
      </Head>
      <RegularLayout>
        <header
          className={`-mb-5 mt-16 w-full max-w-lg border-8 ${
            cartTicketOrders.length > 0
              ? "rounded-t-lg border-b-0"
              : "rounded-lg"
          }  bg-neutral px-8 text-neutral-content`}
        >
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
            <Link href="/" className="btn-primary btn mx-auto mb-8 mt-12">
              Select {isSuccess ? "another" : "a"} Movie & Showtime
            </Link>
          )}
        </header>
        {cartTicketOrders.length > 0 && (
          <>
            {/* TABLE */}
            <section className="-mb-5 w-full max-w-lg border-l-8 border-r-8 bg-neutral pt-5 text-neutral-content">
              <table className="table text-right font-mono">
                <thead>
                  <tr className="border-b-2 border-t-2 border-neutral-content bg-base-300 text-lg text-neutral-content [&>*]:py-2 [&>*]:font-bold">
                    <th>#</th>
                    <th>Movie</th>
                    <th>Showtime</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>{cartTicketOrders.map(TicketRow)}</tbody>
              </table>
            </section>

            <section className="mx-auto w-full max-w-lg rounded-b-lg border-8 border-t-0 bg-neutral px-2 pb-5 pt-5 text-neutral-content">
              {isLoading ? (
                <div className="loading-xl loading loading-spinner mx-auto block"></div>
              ) : errors.badShowtimeIds.length === 0 ? (
                <>
                  <h3 className="mt-4 text-2xl font-bold">
                    &quot;Purchase&quot; Tickets
                  </h3>

                  <div className="divider mb-0 mt-0 w-full"></div>
                  {/* Displays the toals for each type of showing */}
                  <section>
                    <h4 className="mb-2 flex justify-between px-4 text-xl font-semibold">
                      <span>Total -</span>
                      <span>
                        {cartTicketOrders.map((order) => (
                          <>
                            <i className="font-thin capitalize italic">
                              {order.number}{" "}
                              {order.showtimeType.split(/(?=[A-Z])/).join(" ")}-{" "}
                              {order.ticketPrice} $ ea.
                            </i>
                            <br />
                          </>
                        ))}
                      </span>
                      <span className="">
                        {`${cartTicketOrders.reduce(
                          (acc, order) =>
                            acc + order.number * order.ticketPrice,
                          0
                        )} $`}
                      </span>
                    </h4>

                    <div className="divider mb-0 mt-0 w-full"></div>

                    <form
                      onSubmit={handleSubmit}
                      className="join mt-4 w-full justify-center"
                    >
                      <input
                        type="text"
                        name="name"
                        className="input join-item"
                        placeholder="Enter a name here..."
                        onChange={handleChange}
                        maxLength={24}
                      />
                      <button
                        type="submit"
                        className="btn-outline join-item btn"
                      >
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
                    Click the error to go back to the showtime or remove the
                    order from your cart.
                  </p>
                  <p>
                    If you leave this page all erroneous orders will be cleared.
                  </p>
                </>
              )}
            </section>
          </>
        )}
      </RegularLayout>
    </>
  );
}
