import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { gsap } from "gsap";

export const Return = () => {
  const [name, setname] = useState("");
  const [labname, setlabname] = useState("");
  const [issue, setissue] = useState("");
  const formRef = useRef(null);

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

  const add = async (e) => {
    e.preventDefault()
    if (!name || !labname || !issue) {
      alert("Please fill in all fields");
      return;
    }
    const result = await fetch("https://lab-management-system-n3i5.onrender.com/api/return", {
      method: "post",
      body: JSON.stringify({ name, labname, issue }),
      headers: { "Content-type": "application/json;charset=UTF-8" },
    });
    if (result) {
      const res = await result.json();
      if(res.statuscode===1){
        alert("Return recorded successfully")
        setname("");
        setlabname("");
        setissue("");
      }
      else{
        alert("Failed to record return")
      }
    }
  };
  return (
    <>
      <section className="management-page" ref={formRef}>
        <div className="container-fluid dashboard-shell">
          <div className="row g-4 align-items-start">
           <div className="col-12 col-lg-auto">
            <Sidebar></Sidebar>
           </div>
            <div className="col">
              <div className="management-card shadow-sm">
                <p className="section-kicker">Equipment Return</p>
                <h1>Return Equipment</h1>
                <p className="management-subtitle">Record returned devices and note the issue reported by the lab.</p>

                <form onSubmit={add}>
                  <div className="mb-3">
                    <label className="form-label">Return Device</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-pc-display text-muted"></i>
                      </span>
                      <input
                        className="form-control border-start-0 ps-0"
                        type="text"
                        placeholder="e.g. Oscilloscope, Keyboard"
                        value={name}
                        onChange={(e)=>setname(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Lab Number / Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-door-closed text-muted"></i>
                      </span>
                      <input
                        className="form-control border-start-0 ps-0"
                        type="text"
                        placeholder="e.g. LAB 1, LAB 2"
                        value={labname}
                        onChange={(e)=>setlabname(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Issue Category</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-exclamation-triangle text-muted"></i>
                      </span>
                      <select
                        className="form-select management-select border-start-0 ps-0"
                        value={issue}
                        onChange={(e)=>setissue(e.target.value)}
                        required
                      >
                        <option value="">Select Your Issue</option>
                        <option value="Not Working">Not Working</option>
                        <option value="Wire Problem">Wire Problem</option>
                        <option value="Damage of Parts">Damage of Parts</option>
                        <option value="None / Working fine">None / Working fine</option>
                      </select>
                    </div>
                  </div>

                  <button className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2" type="submit">
                    <span>Submit Return</span>
                    <i className="bi bi-arrow-down-left-circle"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
