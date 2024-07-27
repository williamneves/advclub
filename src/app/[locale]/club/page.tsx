import { api } from "@/trpc/server";

export default async function ClubPage() {
  const test = await api.test();
  return <div>{test}</div>;
}