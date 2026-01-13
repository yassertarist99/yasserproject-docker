const express = require("express")
const app = express()
const port = 4002
const Utilisateur = require("./Utilisateur")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const { default: mongoose } = require("mongoose")






mongoose.set('strictQuery' , true)
async function  connectDB() {
    try{
        await mongoose.connect("mongodb://mongo:27017/auth-db")
        console.log("Auth-Service DB connected")
    } catch (err) {
        console.error("Database connection error:" , err)
        process.exit(1)
    }
}

app.use(express.json())


app.post("/auth/register", async (req,res)=>{
    const {nom , email , mot_passe} = req.body
    const userExist = await Utilisateur.findOne({email})
    if(userExist){
        return res.json({message :"Cet utilisateur existe deja"})
    } else {
        bcrypt.hash(mot_passe , 10 , (err , hash)=> {
            if(err) {return res.status(500).json({error:err,})
        }else{
            let password = hash
            const newUtilisateur = new Utilisateur({
                nom,
                email,
                mot_passe: password
            })
            newUtilisateur.save()
                .then(user => res.status(201).json(user))
              .catch(error => res.status(400).json({error}))
        }
        })
    }
})


app.post("/auth/login" , async(req , res)=>{
    const {email , mot_passe} = req.body
    const utilisateur = await Utilisateur.findOne({ email})
    if (!utilisateur){
        return res.json({ message:"Utilisateur introuvable"})
    }else{
        bcrypt.compare(mot_passe,utilisateur.mot_passe).then(resultat =>{
            if(!resultat) {return res.json({ message: "Mot de passe incorrect"})}
            else{ const payload ={
                email , nom :utilisateur.nom}
                jwt.sign(payload , "secret" , (err,token)=>{
                    if (err) console.log(err)
                        else return res.json({ token:token})
                })
            }
        })
    }
})


connectDB().then(()=>{
    app.listen(port , ()=>{
        console.log("Auth-service at "+(port))
    })
})