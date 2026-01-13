const express = require("express")
const app = express()
const PORT = 4000
const mongoose = require("mongoose")
const Produit = require("./Produit")
app.use(express.json())



mongoose.set("strictQuery" , true)
async function connectDB(){
    try{
        await mongoose.connect("mongodb://mongo:27017/produit-db")
        console.log("Produit-Service DB Connected")

    }catch (err){
        console.error("Database connection error:",err)
        process.exit(1)
    }
}



app.post("/produit/ajouter" , (req,res,next)=>{
    const {nom , description , prix} = req.body
    const newProduit = new Produit({
        nom,
        description,
        prix
    })

    newProduit.save()
        .then(produit => res.status(201).json(produit))
        .catch(error => res.status(400).json({error}))
})

app.get("test",(req,res)=>{
    console.log("jgvuv")
})

app.post("/produit/acheter", (req,res)=>{
    const {ids}= req.body
    Produit.find({_id: {$in : ids}})
        .then(produits => res.status(201).json(produits))
        .catch(error => res.status(400).json({error}))
        
})




connectDB().then(()=>{
    app.listen(PORT , ()=>{
        console.log(`product-SErvice at ${PORT}`)
    })
})