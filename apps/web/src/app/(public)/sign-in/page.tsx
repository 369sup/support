import { permanentRedirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ add?: string | readonly string[] }>;
}>): Promise<never> {
  const { add } = await searchParams;

  permanentRedirect(add === "1" ? "/login?add=1" : "/login");
}
