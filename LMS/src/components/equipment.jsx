import { useContext, useState } from "react"
import { Sidebar } from "./sidebar"
import { useNavigate } from "react-router-dom"

export const AddEquipment=()=>{

const [name,setname]=useState("")
const [quantity,setquantity]=useState("")
const {usertype}=useContext()
const navigate=useNavigate()


const add=async(e)=>{
    e.preventDefault()
    const result=await fetch("http://localhost:9000/api/addequipment",{
        method:"post",
        body:JSON.stringify({name,quantity}),
        headers:{"Content-type":"application/json;"}
    })
    if(result){
        const res=await result.json()
        if(res.statuscode===1){
            alert("added")
        }
        else{
            alert("dvfdf")
        }
    }
}

    return(
        <>
      {
        usertype === "Admin"?  <section className="management-page">
            <div className="container">
                <div className="row justify-content-center">
                   <div className="col">
                    <Sidebar></Sidebar>
                   </div>
                    <div className="col-12 col-md-10 col-lg-9">
                        <div className="management-card shadow-sm">
                            <p className="section-kicker">Inventory</p>
                            <h1>Add Equipment</h1>
                            <p className="management-subtitle">Add equipment stock and keep lab inventory records updated.</p>

                            <form onSubmit={add}>
                                <div className="mb-3">
                                    <label className="form-label">Equipment Name</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter equipment name"
                                        onChange={(e)=>setname(e.target.value)}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Quantity</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min="1"
                                        placeholder="Enter quantity"
                                        onChange={(e)=>setquantity(e.target.value)}
                                    />
                                </div>

                                <button className="btn auth-btn w-100" type="submit">Add Equipment</button> 
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>:navigate("/")
      }
        </>
    )
}
