const express = require("express");
const app = express();
const PORT = 4001;
const mongoose = require("mongoose");
const Commande = require("./commond");
const axios=require('axios');
const isAuthenticated =require('./isAuthenticated');


mongoose.set("strictQuery", true);

app.use(express.json())




async function connectDB() {
  try {
    await mongoose.connect("mongodb://mongo:27017/commande-db");
    console.log("Produit-Service DB Connected");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
}




function prixTotal(produits) {
    let total = 0;
    for (let t = 0; t < produits.length; ++t) {
        total += produits[t].prix;
    }
    console.log("prix total :" + total);
    return total;
}
//Cette fonction envoie une requête http au service produit pour récupérer le tableau des produits qu'on désire commander (en se basant sur leurs ids)
async function httpRequest(ids) {
    try {
        const URL = "http://localhost:4000/produit/acheter"
        const response = await axios.post(URL, { ids: ids }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        //appel de la fonction prixTotal pour calculer le prix total de la commande en se basant sur le résultat de la requête http
        return prixTotal(response.data);
    } catch (error) {
        console.error("error");
    }
}
app.post("/commande/ajouter", isAuthenticated, async (req, res, next) => {
    const { ids } = req.body;
    console.log("ids : " + ids);
    httpRequest(req.body.ids).then(total => {
        const newCommande = new Commande({
            produits: ids,
            email_utilisateur: req.user.email,
            prix_total: total,
        });
        console.log("Commande : " + newCommande);
        newCommande.save()
            .then(commande => res.status(201).json(commande))
            .catch(error => res.status(400).json({ error }));
    });
});




connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Auth-service at ${PORT}`);
  });
});