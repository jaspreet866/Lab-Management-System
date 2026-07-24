import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { Link } from "react-router-dom"
import { gsap } from "gsap"

export const LabDash=()=>{
  const [data, setdata] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const labid = searchParams.get("id")
  const labdashRef = useRef(null)

  // Entrance animations for hero
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade and scale down the banner slightly on entry
      gsap.fromTo(".lab-hero",
        { opacity: 0, y: -30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power2.out" }
      );

      // Stagger stats cards
      gsap.fromTo(".stat-card",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: 0.25 }
      );
    }, labdashRef);

    return () => ctx.revert();
  }, []);

  // Stagger lab list cards once loaded
  useEffect(() => {
    if (!loading && data.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".lab-card",
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }
        );
      }, labdashRef);

      return () => ctx.revert();
    }
  }, [loading, data.length]);

const totalCapacity = data.reduce((total, item) => total + Number(item.Capacity || 0), 0)

useEffect(() => {
    const init = async () => {
        if (!labid) return
        setLoading(true)
        try {
            const result = await fetch(`https://lab-management-system-n3i5.onrender.com/api/getlab2/${labid}`, {
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
        <div className="container mt-5 px-md-4" ref={labdashRef}>
            <div className="lab-hero shadow-sm mb-4">
                <div className="row align-items-center justify-content-between g-3">
                    <div className="col-12 col-md-7">
                        <span className="section-kicker text-white-50">Analytics</span>
                        <h1 className="mb-2">Lab Dashboard</h1>
                        <p className="mb-0 text-white-50">Overview of laboratory infrastructure, metrics, and device allocations.</p>
                    </div>
                    
                    <div className="col-12 col-md-5">
                        <div className="stats-row justify-content-md-end">
                            <div className="stat-card">
                                <div className="stat-label">Active Entries</div>
                                <div className="stat-value">{data.length}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Total Capacity</div>
                                <div className="stat-value">{totalCapacity}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    {loading ? (
                        <div className="d-flex flex-column align-items-center justify-content-center my-5 py-5 text-muted">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span>Retrieving laboratory records...</span>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="alert alert-info d-flex align-items-center gap-3 shadow-sm border-0 py-3" role="alert">
                            <i className="bi bi-info-circle-fill text-info fs-4"></i>
                            <div>No laboratory records found for this ID. Select a valid lab from the header dropdown menu.</div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {data.map((a) => (
                                <div className="col-12 col-md-6 col-lg-4" key={a._id || a.LabName}>
                                    <div className="card lab-card h-100 border-0">
                                        <div className="card-body d-flex flex-column justify-content-between">
                                            <div>
                                                <h5 className="card-title lab-title d-flex align-items-center gap-2">
                                                    <i className="bi bi-door-closed text-primary"></i>
                                                    <span>{a.LabName}</span>
                                                </h5>
                                                
                                                <div className="mt-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2 text-secondary">
                                                        <i className="bi bi-person-vcard text-muted"></i>
                                                        <span className="small">Incharge: <strong>{a.LabIncharge}</strong></span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 text-secondary">
                                                        <i className="bi bi-people text-muted"></i>
                                                        <span className="small">Max Students: <strong>{a.Capacity}</strong></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                                                <Link to="/return" className="btn btn-return d-flex align-items-center gap-2">
                                                    <i className="bi bi-arrow-down-left-circle"></i>
                                                    <span>Return a Device</span>
                                                </Link>
                                            </div>
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