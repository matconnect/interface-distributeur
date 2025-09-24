import express from "express";

const app = express();
const port = 3001;

const produits = [
  { id: 1, nom: "Coca-Cola", prix: 2 },
  { id: 2, nom: "Snickers", prix: 1.5 },
  { id: 3, nom: "Eau minérale", prix: 1 },
];

app.get("/api/produits", (req, res) => {
  res.json(produits);
});

app.listen(port, () => {
  console.log(`✅ API backend dispo sur http://localhost:${port}`);
});
