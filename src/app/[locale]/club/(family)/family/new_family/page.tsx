
import { api } from "@/trpc/server";
import { NewFamilyForm } from "../_components/new-family-form";
import { redirect } from "next/navigation";

export default async function NewFamilyPage() {
  const family = await api.club.families.getLoggedInFamily()
  // if (family) {
  //   console.log("Family found", family)
  //    redirect("/club/family")
  // }
  return <NewFamilyForm />
}