const mongoose = require("mongoose")
const cors = require("cors")
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv").config()

const JWT_SECRET = process.env.JWT_SECRET || "lms_jwt_secret_key_2026_secure"

const app = express()

// Enable CORS for localhost (all ports), local IP, Vercel, and Render deployments
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true)
        return callback(null, true)
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}))

app.use(express.json())

app.listen(9000, () => {
    console.log("Server is Running on port 9000")
})

mongoose.connect(process.env.Mongo_url)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Not Connected to MongoDB:", err))

// ----------------------------------------------------
// SCHEMAS & MODELS
// ----------------------------------------------------

const userdata = mongoose.Schema({
    Name: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    CreatedAt: { type: Date, default: Date.now }
})

const user = mongoose.model("Registration", userdata)

const auditSchema = mongoose.Schema({
    action: { type: String, required: true },
    details: { type: String, required: true },
    user: { type: String, default: "Admin" },
    category: { type: String, default: "general" },
    timestamp: { type: Date, default: Date.now }
})

const AuditLog = mongoose.model("AuditLog", auditSchema)

// Helper to record audit log
const recordAudit = async (action, details, user = "Admin", category = "general") => {
    try {
        await new AuditLog({ action, details, user, category }).save()
    } catch (err) {
        console.error("Audit log error:", err)
    }
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES (BCRYPT + JWT)
// ----------------------------------------------------

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, pass } = req.body || {}
        if (!name || !email || !pass) {
            return res.status(400).send({ statuscode: 0, message: "All fields are required" })
        }

        const existingUser = await user.findOne({ Email: email })
        if (existingUser) {
            return res.status(400).send({ statuscode: 0, message: "Email already registered" })
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(pass, 10)

        const newUser = new user({
            Name: name,
            Email: email,
            Password: hashedPassword
        })
        const response = await newUser.save()
        if (response) {
            await recordAudit("User Registered", `New user registered: ${name} (${email})`, name, "auth")
            res.send({ statuscode: 1, message: "Registered successfully" })
        } else {
            res.send({ statuscode: 0, message: "Registration failed" })
        }
    } catch (err) {
        console.error("Register error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

app.post("/api/login", async (req, res) => {
    try {
        const { email, pass } = req.body || {}
        if (!email || !pass) {
            return res.status(400).send({ statuscode: 0, message: "Email and password required" })
        }

        // Admin authentication
        if (email.toLowerCase() === "admin@gmail.com" && pass === "Admin@123") {
            const token = jwt.sign(
                { email: "Admin@gmail.com", name: "Administrator", utype: "Admin" },
                JWT_SECRET,
                { expiresIn: "7d" }
            )
            await recordAudit("Admin Login", "Administrator logged in to dashboard", "Admin", "auth")
            return res.send({
                statuscode: 2,
                utype: "Admin",
                token,
                user: { name: "Administrator", email: "Admin@gmail.com", utype: "Admin" }
            })
        }

        const foundUser = await user.findOne({ Email: email })
        if (!foundUser) {
            return res.send({ statuscode: 0, message: "Invalid email or password" })
        }

        // Check password: first try bcrypt, then graceful fallback for existing plain-text accounts
        let isMatch = false
        if (foundUser.Password && (foundUser.Password.startsWith("$2a$") || foundUser.Password.startsWith("$2b$"))) {
            isMatch = await bcrypt.compare(pass, foundUser.Password)
        } else if (foundUser.Password === pass) {
            // Graceful migration: update plain-text password to bcrypt hash
            isMatch = true
            const upgradedHash = await bcrypt.hash(pass, 10)
            await user.updateOne({ _id: foundUser._id }, { $set: { Password: upgradedHash } })
        }

        if (isMatch) {
            const token = jwt.sign(
                { id: foundUser._id, email: foundUser.Email, name: foundUser.Name, utype: "User" },
                JWT_SECRET,
                { expiresIn: "7d" }
            )
            await recordAudit("User Login", `User logged in: ${foundUser.Name}`, foundUser.Name, "auth")
            return res.send({
                statuscode: 1,
                utype: "User",
                token,
                user: { name: foundUser.Name, email: foundUser.Email, utype: "User" }
            })
        } else {
            return res.send({ statuscode: 0, message: "Invalid email or password" })
        }
    } catch (err) {
        console.error("Login error:", err)
        return res.status(500).send({ statuscode: 0, error: err.message })
    }
})

// ----------------------------------------------------
// LABS
// ----------------------------------------------------

const Labs = mongoose.Schema({
    LabName: String,
    LabIncharge: String,
    Capacity: String,
    CreatedAt: { type: Date, default: Date.now }
})

const lab = mongoose.model("Labs", Labs)

app.post("/api/addlab", async (req, res) => {
    try {
        const newLab = new lab({
            LabName: req.body.labname,
            LabIncharge: req.body.incharge,
            Capacity: req.body.capacity
        })
        const response = await newLab.save()
        if (response) {
            await recordAudit("Lab Created", `Created lab "${req.body.labname}" (Incharge: ${req.body.incharge})`, "Admin", "lab")
            res.send({ statuscode: 1 })
        } else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        console.error("Add lab error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

app.get("/api/getlab", async (req, res) => {
    try {
        const result = await lab.find().sort({ _id: -1 })
        if (result) {
            res.send({ statuscode: 1, data: result })
        } else {
            res.send({ statuscode: 0, data: [] })
        }
    } catch (err) {
        console.error("Get lab error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

app.get("/api/getlab2/:id", async (req, res) => {
    try {
        const result = await lab.find({ _id: req.params.id })
        if (result) {
            res.send({ statuscode: 1, data: result })
        } else {
            res.send({ statuscode: 0, data: [] })
        }
    } catch (err) {
        console.error("Get lab2 error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

// ----------------------------------------------------
// EQUIPMENT
// ----------------------------------------------------

const Equipments = mongoose.Schema({
    EquipmentName: String,
    Quantity: Number,
    Date: String,
    Status: String
})

const equipment = mongoose.model("Equipments", Equipments)

app.post("/api/addequipment", async (req, res) => {
    try {
        const qty = Number(req.body.quantity) || 0
        const newEquipment = new equipment({
            EquipmentName: req.body.name,
            Quantity: qty,
            Status: qty > 0 ? "Avaliable" : "Out of Stock",
            Date: new Date().toISOString()
        })
        const response = await newEquipment.save()
        if (response) {
            await recordAudit("Equipment Added", `Added ${qty} unit(s) of "${req.body.name}" to inventory`, "Admin", "inventory")
            res.send({ statuscode: 1 })
        } else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        console.error("Add equipment error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

app.get("/api/allequipments", async (req, res) => {
    try {
        const result = await equipment.find().sort({ _id: -1 })
        if (result) {
            res.send({ statuscode: 1, data: result })
        } else {
            res.send({ statuscode: 0, data: [] })
        }
    } catch (err) {
        console.error("All equipments error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

app.put("/api/updateequip/:id", async (req, res) => {
    try {
        const newQty = Number(req.body.newquantity)
        const result = await equipment.updateOne({ _id: req.params.id }, {
            $set: {
                Quantity: newQty,
                Status: newQty > 0 ? "Avaliable" : "Out of Stock"
            }
        })
        if (result.modifiedCount > 0) {
            res.send({ statuscode: 1 })
        } else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        console.error("Update equipment error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

// ----------------------------------------------------
// RETURNS
// ----------------------------------------------------

const Returned = mongoose.Schema({
    Name: String,
    LabName: String,
    Issue: String,
    Date: String,
    Status: String
})

const returnequip = mongoose.model("Return", Returned)

app.post("/api/return", async (req, res) => {
    try {
        const newReturn = new returnequip({
            Name: req.body.name,
            LabName: req.body.labname,
            Issue: req.body.issue,
            Date: new Date().toISOString(),
            Status: "Pending"
        })
        const response = await newReturn.save()
        if (response) {
            await recordAudit("Return Logged", `Return report logged for "${req.body.name}" from ${req.body.labname}: ${req.body.issue}`, "User", "return")
            res.send({ statuscode: 1 })
        } else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        console.error("Return error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

app.get("/api/returndata", async (req, res) => {
    try {
        const result = await returnequip.find().sort({ _id: -1 })
        if (result) {
            res.send({ statuscode: 1, data: result })
        } else {
            res.send({ statuscode: 0, data: [] })
        }
    } catch (err) {
        console.error("Return data error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

// ----------------------------------------------------
// ALLOCATIONS
// ----------------------------------------------------

const Allocation = mongoose.Schema({
    Lab: String,
    Equipment: String,
    IssueDate: String,
    Quantity: Number,
    CreatedAt: { type: Date, default: Date.now }
})

const allocate = mongoose.model("Allocations", Allocation)

app.post("/api/allocate", async (req, res) => {
    try {
        const newAllocation = new allocate({
            Lab: req.body.selectedLab,
            Equipment: req.body.equipment,
            IssueDate: req.body.issueDate,
            Quantity: req.body.quantity
        })
        const response = await newAllocation.save()
        if (response) {
            await recordAudit(
                "Equipment Allocated",
                `Allocated ${req.body.quantity} unit(s) of "${req.body.equipment}" to ${req.body.selectedLab}`,
                "Admin",
                "allocation"
            )
            res.send({ statuscode: 1 })
        } else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        console.error("Allocate error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

app.get("/api/allocations", async (req, res) => {
    try {
        const result = await allocate.find().sort({ _id: -1 })
        res.send({ statuscode: 1, data: result })
    } catch (err) {
        console.error("Get allocations error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

// ----------------------------------------------------
// AUDIT LOGS & STATS APIS
// ----------------------------------------------------

app.get("/api/auditlogs", async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(30)
        res.send({ statuscode: 1, data: logs })
    } catch (err) {
        console.error("Get audit logs error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})

app.get("/api/stats", async (req, res) => {
    try {
        const [equipments, labsList, returns, allocationsList, auditLogs] = await Promise.all([
            equipment.find(),
            lab.find(),
            returnequip.find(),
            allocate.find(),
            AuditLog.find().sort({ timestamp: -1 }).limit(10)
        ])

        const totalEquipmentQty = equipments.reduce((sum, item) => sum + Number(item.Quantity || 0), 0)
        const totalAllocatedQty = allocationsList.reduce((sum, item) => sum + Number(item.Quantity || 0), 0)
        const totalInventory = totalEquipmentQty + totalAllocatedQty
        const utilizationRate = totalInventory > 0 ? Math.round((totalAllocatedQty / totalInventory) * 100) : 0

        const lowStockItems = equipments.filter(item => Number(item.Quantity || 0) <= 5)
        const pendingReturns = returns.filter(item => item.Status === "Pending")

        res.send({
            statuscode: 1,
            data: {
                totalEquipmentQty,
                totalEquipmentTypes: equipments.length,
                totalLabs: labsList.length,
                totalCapacity: labsList.reduce((sum, item) => sum + Number(item.Capacity || 0), 0),
                totalAllocations: allocationsList.length,
                totalAllocatedQty,
                utilizationRate,
                lowStockCount: lowStockItems.length,
                lowStockItems,
                pendingReturnsCount: pendingReturns.length,
                recentActivity: auditLogs
            }
        })
    } catch (err) {
        console.error("Get stats error:", err)
        res.status(500).send({ statuscode: 0, error: err.message })
    }
})


