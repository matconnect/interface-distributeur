import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = [process.env.APP_URL_DEV, process.env.APP_URL_PROD];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

const port = process.env.PORT;

const produits = [
  { id: 1, nom: "Coca-Cola", prix: 2, code: "0001" },
  { id: 2, nom: "Snickers", prix: 1.5, code: "0002" },
  { id: 3, nom: "Eau minérale", prix: 1, code: "0003" },
];

app.get("/api/produits", (req, res) => {
  res.json(produits);
});

app.post("/api/commande", (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Le champ 'code' est requis et doit être une chaîne." });
  }

  if (!/^\d{4}$/.test(code)) {
    return res.status(400).json({ error: "Le code doit contenir exactement 4 chiffres." });
  }

  const produit = produits.find((p) => String(p.code) === code);

  if (!produit) {
    return res.status(404).json({ error: "Aucun produit trouvé pour ce code." });
  }

  return res.json({
    success: true,
    produit: {
      nom: produit.nom,
      prix: produit.prix,
    },
    message: `${produit.nom} en préparation...`,
  });
});

app.listen(port, () => {
  console.log(`✅ API backend dispo sur http://localhost:${port}`);
});
