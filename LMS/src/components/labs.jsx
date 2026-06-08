import { useState } from "react"

export const Lab=()=>{


    const [incharge,setincharge]=useState("")
    const [labname,setlabname]=useState("")
    const[capacity,setcapacity]=useState("")


    const add=async(e)=>{
        e.preventDefault()
        const result=await fetch("http://localhost:9000/api/addlab",{
            method:"post",
            body:JSON.stringify({incharge,labname,capacity}),
            headers:{"Content-type":"application/json;charset=UTF-8"}
        })
        if(result){
            const res=await result.json()
            if(res.statuscode===1){
                alert("added")
            }
            else{
                alert("not")
            }
        }
    }


    return(
        <>
        <section className="management-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-7">
                        <div className="management-card shadow-sm">
                            <p className="section-kicker">Lab Setup</p>
                            <h1>Add Lab</h1>
                            <p className="management-subtitle">Create a lab record with incharge details and capacity.</p>

                            <form onSubmit={add}>
                                <div className="mb-3">
                                    <label className="form-label">Lab Incharge</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Lab Incharge"
                                        onChange={(e)=>setincharge(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Lab Name</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Lab Name"
                                        onChange={(e)=>setlabname(e.target.value)}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Maximum Capacity</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min="1"
                                        placeholder="Maximum Capacity"
                                        onChange={(e)=>setcapacity(e.target.value)}
                                    />
                                </div>

                                <button className="btn auth-btn w-100" type="submit">Add Lab</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}
