import { getTranslations } from "next-intl/server"
import PricingClient from "./pricing-client"

export default async function PricingPage() {
  const t = await getTranslations("pricing")

  return <PricingClient />
}
