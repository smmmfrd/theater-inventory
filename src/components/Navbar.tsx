import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 -mb-5 bg-primary py-3 pl-4">
      <Link href="/" className="link no-underline hover:underline">
        <h1 className="text-2xl font-thin">Fake Theater</h1>
      </Link>
    </nav>
  );
}
