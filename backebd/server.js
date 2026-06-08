const mongoose=require("mongoose")
const cors=require("cors")
const express=require("express")
const bcrypt=require("bcrypt")

const app=express()

app.use(cors())
app.use(express.json())

app.listen(9000,()=>{
    console.log("Server is Running")
})

mongoose.connect("mongodb+srv://itannjass_db_user:k8Aip0NhAzoeIpdH@cluster0.tsjm4en.mongodb.net/LMS")
.then(()=>console.log("Coonected to MongoDB"))
.catch(()=>console.log("Not Connected"))

const userdata=mongoose.Schema({
    Name:String,
    Email:String,
    Password:String
})

const user=mongoose.model("Registration",userdata)

app.post("/api/register",async(req,res)=>{
    const result=await user({
        Name:req.body.name,
        Email:req.body.email,
        Password:req.body.pass
    })
    if(result){
        const response=await result.save()
        if(response){
            res.send({statuscode:1})
        }
        else{
            res.send({statucode:0})
        }
    }
})

app.post("/api/login",async(req,res)=>{
    if(req.body.email=="Admin@gmail.com"&&req.body.pass=="Admin@123"){
        res.send({statuscode:2})
    }
    else{
const result=await user.findOne({Email:req.body.email})
    console.log(result)
    console.log(req.body.pass)
    console.log(req.body.email)
    if(result.Email==req.body.email && result.Password==req.body.pass){
        res.send({statuscode:1})
    }
    else{
        res.send({statuscode:0})
    }
    }
    
})

// Labs Schema Model

const Labs=mongoose.Schema({
    LabName:String,
    LabIncharge:String,
    Capacity:String
})

const lab=mongoose.model("Labs" , Labs)

app.post("/api/addlab",async(req,res)=>{
    const result=await lab({
        LabName:req.body.labname,
        LabIncharge:req.body.incharge,
        Capacity:req.body.capacity
    })
    if(result){
        const response=await result.save()
        if(response){
            res.send({statuscode:1})
        }
        else{
            res.send({statuscode:0})
        }
    }
})

app.get("/api/getlab",async(req,res)=>{
    const result=await lab.find()
    if(result){
        res.send({statuscode:1,data:result})
    }
    else{
        res.send({statucode:0})
    }
})



// Equipment Add Remove
const Equipments=mongoose.Schema({
EquipmentName:String,
Quantity:Number,
Date:String,
Status:String
})

const equipment=mongoose.model("Equipments",Equipments)

app.post("/api/addequipment",async(req,res)=>{
    const result=await equipment({
        EquipmentName:req.body.name,
        Quantity:req.body.quantity,
        Status:"Avaliable",
        Date:new Date()
    })
    if(result){
        const response=await result.save()
        if(response){
            res.send({statuscode:1})
        }
        else{
            res.send({statuscode:0})
        }
    }
})


// return schema modal

const Returned=mongoose.Schema({
    Name:String,
    LabName:String,
    Issue:String,
    Date:String,
    Status:String
})

const returnequip=mongoose.model("Return",Returned)

app.post("/api/return",async(req,res)=>{
    const result=await returnequip({
        Name:req.body.name,
        LabName:req.body.labname,
        Issue:req.body.issue,
        Date:new Date(),
        Status:"Pending"
    })
    if(result){
        const response=await result.save()
        if(response){
            res.send({statuscode:1})
        }
        else{
            res.send({statucode:0})
        }
    }
})