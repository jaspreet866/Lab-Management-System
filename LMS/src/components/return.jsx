import { useState } from "react";
import { Sidebar } from "./sidebar";

export const Return = () => {
  const [name, setname] = useState("");
  const [labname, setlabname] = useState("");
  const [issue, setissue] = useState("");

  const add = async (e) => {
    e.preventDefault()
    const result = await fetch("http://localhost:9000/api/return", {
      method: "post",
      body: JSON.stringify({ name, labname, issue }),
      headers: { "Content-type": "application/json;" },
    });
    if (result) {
      const res = await result.json();
      if(res.statuscode===1){
        alert("ok")
      }
      else{
        alert("not ok")
      }
    }
  };
  return (
    <>
      <section className="management-page">
        <div className="container">
          <div className="row justify-content-center">
           <div className="col">
            <Sidebar></Sidebar>
           </div>
            <div className="col-6 col-md-10 col-lg-9">
              <div className="management-card shadow-sm">
                <p className="section-kicker">Equipment Return</p>
                <h1>Return Equipment</h1>
                <p className="management-subtitle">Record returned devices and note the issue reported by the lab.</p>

                <form onSubmit={add}>
                  <div className="mb-3">
                    <label className="form-label">Return Device</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter return device"
                      onChange={(e)=>setname(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Lab Number</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter lab number"
                      onChange={(e)=>setlabname(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Issue</label>
                    <select
                      className="form-select management-select"
                      value={issue}
                      onChange={(e)=>setissue(e.target.value)}
                    >
                      <option value="">Select Your Issue</option>
                      <option>Not Working</option>
                      <option>Wire Problem</option>
                      <option>Damage of Parts</option>
                    </select>
                  </div>

                  <button className="btn auth-btn w-100" type="submit">Add Return</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
