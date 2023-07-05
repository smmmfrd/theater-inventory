import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="absolute left-4 top-1/3 flex items-center gap-6 p-2">
      <h2 className="text-3xl font-bold">404</h2>
      <div className="divider divider-horizontal"></div>
      <p className="flex flex-col gap-2 font-medium">
        This Page Could not be found.
        <Link href="/" className="link">
          Back to home page...
        </Link>
      </p>
    </div>
  );
}
