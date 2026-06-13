import {Route, Routes} from "react-router-dom"
import { Login } from "./login"
import { Register } from "./register"
import { Sidebar } from "./sidebar"
import { Lab } from "./labs"
import { AddEquipment } from "./equipment"
import { Allocate } from "./issue"
import { Dashboard } from "./dashboard"
import { Return } from "./return"
export const Routee=()=>{



    return(
        <>
      <Routes>
        <Route path="/" element={<Login></Login>}></Route>
        <Route path="/register" element={<Register></Register>}/>
        <Route path="/side" element={<Sidebar></Sidebar>}/>
        <Route path="/lab" element={<Lab></Lab>}/>
        <Route path="/equipment" element={<AddEquipment></AddEquipment>}/>
        <Route path="/allocate" element={<Allocate></Allocate>}/>
        <Route path="/dashboard" element={<Dashboard></Dashboard>}/>
        <Route path="/return" element={<Return></Return>}/>
    </Routes>  
        </>
    )
}