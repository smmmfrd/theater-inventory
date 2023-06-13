import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto flex justify-center bg-base-300 py-1">
      <span>
        &copy; <Link href="https://github.com/smmmfrd">smmmfrd</Link>
      </span>
    </footer>
  );
}
