import { redirect } from "next/navigation";

export default function SaleRedirectPage() {
  redirect("/products?type=sale");
}
