import { redirect } from "next/navigation";

export default function NewProductsRedirectPage() {
  redirect("/products?type=new");
}

