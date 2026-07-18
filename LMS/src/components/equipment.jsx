import { useContext, useEffect, useState, useRef } from "react"
import { Sidebar } from "./sidebar"
import { useNavigate } from "react-router-dom"
import { Context } from "./context"
import { gsap } from "gsap"

export const AddEquipment=()=>{

const [name,setname] = useState("")
const [quantity,setquantity] = useState("")
const {usertype} = useContext(Context)
const navigate = useNavigate()
const formRef = useRef(null)

useEffect(() => {
    const ctx = gsap.context(() => {
        gsap.fromTo(".management-card",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
        gsap.fromTo(".management-card form > *",
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.15 }
        );
    }, formRef);
    return () => ctx.revert();
}, []);

useEffect(() => {
    if (usertype !== "Admin" && localStorage.getItem("Utype") !== "Admin") {
        navigate("/");
    }
}, [usertype, navigate]);

const add=async(e)=>{
    e.preventDefault()
    if (!name || !quantity) {
        alert("Please fill in all fields")
        return
    }
    const result=await fetch("http://localhost:9000/api/addequipment",{
        method:"post",
        body:JSON.stringify({name,quantity}),
        headers:{"Content-type":"application/json;charset=UTF-8"}
    })
    if(result){
        const res=await result.json()
        if(res.statuscode===1){
            alert("Equipment added successfully")
            setname("")
            setquantity("")
        }
        else{
            alert("Failed to add equipment")
        }
    }
}

    return(
        <>
        <section className="management-page" ref={formRef}>
            <div className="container-fluid dashboard-shell">
                <div className="row g-4 align-items-start">
                   <div className="col-12 col-lg-auto">
                    <Sidebar></Sidebar>
                   </div>
                    <div className="col">
                        <div className="management-card shadow-sm">
                            <p className="section-kicker">Inventory</p>
                            <h1>Add Equipment</h1>
                            <p className="management-subtitle">Add equipment stock and keep lab inventory records updated.</p>

                            <form onSubmit={add}>
                                <div className="mb-3">
                                    <label className="form-label">Equipment Name</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-cpu text-muted"></i>
                                        </span>
                                        <input
                                            className="form-control border-start-0 ps-0"
                                            type="text"
                                            placeholder="e.g. Oscilloscope, Multimeter"
                                            value={name}
                                            onChange={(e)=>setname(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Quantity</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-hash text-muted"></i>
                                        </span>
                                        <input
                                            className="form-control border-start-0 ps-0"
                                            type="number"
                                            min="1"
                                            placeholder="e.g. 5"
                                            value={quantity}
                                            onChange={(e)=>setquantity(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2" type="submit">
                                    <span>Add Equipment</span>
                                    <i className="bi bi-plus-circle"></i>
                                </button> 
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}
