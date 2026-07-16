import { useState } from "react"
import { Sidebar } from "./sidebar"

export const Lab=()=>{

    const [incharge,setincharge]=useState("")
    const [labname,setlabname]=useState("")
    const[capacity,setcapacity]=useState("")

    const add=async(e)=>{
        e.preventDefault()
        if (!incharge || !labname || !capacity) {
            alert("Please fill in all fields")
            return
        }
        const result=await fetch("http://localhost:9000/api/addlab",{
            method:"post",
            body:JSON.stringify({incharge,labname,capacity}),
            headers:{"Content-type":"application/json;charset=UTF-8"}
        })
        if(result){
            const res=await result.json()
            if(res.statuscode===1){
                alert("Lab added successfully")
            }
            else{
                alert("Failed to add lab")
            }
        }
    }

    return(
        <>
        <section className="management-page">
            <div className="container-fluid dashboard-shell">
                <div className="row g-4 align-items-start">
                    <div className="col-12 col-lg-auto">
                        <Sidebar></Sidebar>
                    </div>
                    <div className="col">
                        <div className="management-card shadow-sm">
                            <p className="section-kicker">Lab Setup</p>
                            <h1>Add Lab</h1>
                            <p className="management-subtitle">Create a lab record with incharge details and capacity.</p>

                            <form onSubmit={add}>
                                <div className="mb-3">
                                    <label className="form-label">Lab Incharge</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-person-badge text-muted"></i>
                                        </span>
                                        <input
                                            className="form-control border-start-0 ps-0"
                                            type="text"
                                            placeholder="e.g. Dr. John Doe"
                                            value={incharge}
                                            onChange={(e)=>setincharge(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Lab Name</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-building text-muted"></i>
                                        </span>
                                        <input
                                            className="form-control border-start-0 ps-0"
                                            type="text"
                                            placeholder="e.g. Physics Lab 1"
                                            value={labname}
                                            onChange={(e)=>setlabname(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Maximum Capacity</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-people text-muted"></i>
                                        </span>
                                        <input
                                            className="form-control border-start-0 ps-0"
                                            type="number"
                                            min="1"
                                            placeholder="e.g. 30"
                                            value={capacity}
                                            onChange={(e)=>setcapacity(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2" type="submit">
                                    <span>Add Lab</span>
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
