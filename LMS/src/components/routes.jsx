import {Route, Routes} from "react-router-dom"
import { Login } from "./login"
import { Register } from "./register"
export const Routee=()=>{



    return(
        <>
      <Routes>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/register" element={<Register></Register>}/>
    </Routes>  
        </>
    )
}