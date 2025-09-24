import { Produit } from "@/types";

export default async function ProduitsPage() {
  const res = await fetch("http://localhost:3001/api/produits", {
    cache: "no-store",
  });
  const produits: Produit[] = await res.json();

  return (
    <ul>
      {produits.map((p) => (
        <li key={p.id}>
          {p.nom} - {p.prix} €
        </li>
      ))}
    </ul>
  );
}
