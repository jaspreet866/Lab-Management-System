import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Link } from "react-router-dom"

export const LabDash=()=>{


const [data, setdata] = useState([])
const [loading, setLoading] = useState(false)
const [searchParams] = useSearchParams()
const labid = searchParams.get("id")

const totalCapacity = data.reduce((total, item) => total + Number(item.Capacity || 0), 0)

useEffect(() => {
    const init = async () => {
        if (!labid) return
        setLoading(true)
        try {
            const result = await fetch(`http://localhost:9000/api/getlab2/${labid}`, {
                method: "get",
            })
            if (result) {
                const res = await result.json()
                if (res.statuscode === 1) {
                    setdata(res.data)
                } else {
                    setdata([])
                }
            }
        } catch (err) {
            console.error("Failed to load lab data:", err)
            setdata([])
        } finally {
            setLoading(false)
        }
    }

    init()
}, [labid])



    return(
        <>
        <div className="container mt-5">
            <div className="lab-hero shadow-sm p-4 rounded-3 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="mb-1">Lab Dashboard</h1>
                        <p className="mb-0 text-muted">Overview of the lab and equipment. Use the cards below to manage returns.</p>
                    </div>
                    
                </div>
                <div className="stats-row mt-3 d-flex gap-3">
                    <div className="stat-card p-3">
                        <div className="stat-label">Entries</div>
                        <div className="stat-value">{data.length}</div>
                    </div>
                    <div className="stat-card p-3">
                        <div className="stat-label">Total Capacity</div>
                        <div className="stat-value">{totalCapacity}</div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div>
                    {loading ? (
                        <div className="d-flex justify-content-center my-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="alert alert-info">No lab information found.</div>
                    ) : (
                        <div className="row">
                            {data.map((a) => (
                                <div className="col-12 col-md-6 col-lg-4 mb-3" key={a._id || a.LabName}>
                                    <div className="card lab-card h-100">
                                        <div className="card-body">
                                            <h5 className="card-title lab-title">{a.LabName}</h5>
                                            <p className="card-text lab-meta mb-2">
                                                <strong>Incharge:</strong> {a.LabIncharge}
                                            </p>
                                            <p className="card-text lab-meta">
                                                <strong>Capacity:</strong> {a.Capacity}
                                            </p>
                                        </div>
                                        <div className="card-footer bg-transparent border-0 d-flex justify-content-end">
                                          <Link to="/return"><button className="btn btn-return">Return a Device</button></Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    )
}