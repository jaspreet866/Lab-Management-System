import { useEffect, useState } from "react"

export const Allocate=()=>{

const[labs,setlabs]=useState([])
const[selectedLab,setselectedLab]=useState("")
const[issueDate,setissueDate]=useState("")
const[quantity,setquantity]=useState("")


useEffect(()=>{
    show();
},[])

    const issue=async(e)=>{
        e.preventDefault()
    }

    const show=async()=>{
        const result=await fetch("http://localhost:9000/api/getlab",{
            method:"get"
        })
        if(result){
            const res=await result.json()
            if(res.statuscode===1){
                alert("fetched")
                setlabs(res.data)
            }
            else{
                alert("fgh")
            }
        }
    }
    return(<>
    <section className="management-page">
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-7">
                    <div className="management-card shadow-sm">
                        <p className="section-kicker">Equipment Issue</p>
                        <h1>Allocate Equipment</h1>
                        <p className="management-subtitle">Select a lab, issue date, and quantity for allocation.</p>

                        <form onSubmit={issue}>
                            <div className="mb-3">
                                <label className="form-label">Select Lab</label>
                                <select
                                    className="form-select management-select"
                                    value={selectedLab}
                                    onChange={(e)=>setselectedLab(e.target.value)}
                                >
                                    <option value="">Select Lab</option>
                                    {
                                        labs.map((a)=>
                                            <option key={a._id || a.LabName} value={a.LabName}>{a.LabName}</option>
                                        )
                                    }
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Issue Date</label>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={issueDate}
                                    onChange={(e)=>setissueDate(e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Quantity</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    min="1"
                                    placeholder="Quantity"
                                    value={quantity}
                                    onChange={(e)=>setquantity(e.target.value)}
                                />
                            </div>

                            <button className="btn auth-btn w-100" type="submit">Allocate</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
    </>)
}
