import { useRouter } from "next/router";
import { useEffect } from "react";

export default function MovieHomePage() {
  const { push } = useRouter();

  useEffect(() => {
    push("/");
  }, []);

  return <div></div>;
}
