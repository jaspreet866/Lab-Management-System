import { useContext, useEffect, useState, useRef } from "react";
import { Sidebar } from "./sidebar";
import { useNavigate } from "react-router-dom";
import { Context } from "./context";
import { gsap } from "gsap";

export const Allocate = () => {
  const [labs, setlabs] = useState([]);
  const [selectedLab, setselectedLab] = useState("");
  const [issueDate, setissueDate] = useState("");
  const [quantity, setquantity] = useState("");
  const [allequip, setallequip] = useState([]);
  const [equipment, setequipment] = useState("");
  const {usertype}=useContext(Context)
  const navigate=useNavigate()
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

  useEffect(() => {
    show();
    show2();
  }, []);

  const show = async () => {
    const result = await fetch("https://lab-management-system-n3i5.onrender.com/api/getlab", {
      method: "get",
    });

    const res = await result.json();

    if (res.statuscode === 1) {
      setlabs(res.data);
    }
  };

  const show2 = async () => {
    const result = await fetch("https://lab-management-system-n3i5.onrender.com/api/allequipments", {
      method: "get",
    });

    const res = await result.json();

    if (res.statuscode === 1) {
      setallequip(res.data);
    }
  };

  const upd = async (newquantity) => {
    const result = await fetch(
      `https://lab-management-system-n3i5.onrender.com/api/updateequip/${equipment}`,
      {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newquantity }),
      },
    );

    const res = await result.json();

    if (res.statuscode !== 1) {
      alert("Update failed");
    }
  };

  const allocate = async (e) => {
    e.preventDefault();

    const selectedEquipment = allequip.find((item) => item._id === equipment);

    if (!selectedLab) {
      alert("Please select a lab");
      return;
    }

    if (!selectedEquipment) {
      alert("Select equipment");
      return;
    }

    if (!issueDate) {
      alert("Please select an issue date");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (selectedEquipment.Quantity < Number(quantity)) {
      alert("Not enough quantity available");
      return;
    }

    const result = await fetch("https://lab-management-system-n3i5.onrender.com/api/allocate", {
      method: "post",
      body: JSON.stringify({
        selectedLab,
        issueDate,
        quantity,
        equipment,
      }),
      headers: {
        "Content-type": "application/json",
      },
    });

    const res = await result.json();

    if (res.statuscode === 1) {
      alert("Allocated successfully!");

      const remainingQuantity = selectedEquipment.Quantity - Number(quantity);

      await upd(remainingQuantity);
      setselectedLab("");
      setequipment("");
      setissueDate("");
      setquantity("");

      // Refresh equipment list
      show2();
    } else {
      alert("Allocation failed");
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
                <p className="section-kicker">Equipment Issue</p>

                <h1>Allocate Equipment</h1>

                <p className="management-subtitle">
                  Select a lab, equipment, issue date, and quantity for allocation.
                </p>

                <form onSubmit={allocate}>
                  <div className="mb-3">
                    <label className="form-label">Select Lab</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-building text-muted"></i>
                      </span>
                      <select
                        className="form-select management-select border-start-0 ps-0"
                        value={selectedLab}
                        onChange={(e) => setselectedLab(e.target.value)}
                        required
                      >
                        <option value="">Select Lab</option>
                        {labs.map((a) => (
                          <option key={a._id} value={a.LabName}>
                            {a.LabName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Select Equipment</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-cpu text-muted"></i>
                      </span>
                      <select
                        className="form-select management-select border-start-0 ps-0"
                        value={equipment}
                        onChange={(e) => setequipment(e.target.value)}
                        required
                      >
                        <option value="">Select Equipment</option>
                        {allequip.map((a) => (
                          <option key={a._id} value={a.EquipmentName}>
                            {a.EquipmentName} ({a.Quantity} available)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Issue Date</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-calendar-event text-muted"></i>
                      </span>
                      <input
                        className="form-control border-start-0 ps-0"
                        type="date"
                        value={issueDate}
                        onChange={(e) => setissueDate(e.target.value)}
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
                        value={quantity}
                        placeholder="Quantity to issue"
                        onChange={(e) => setquantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2" type="submit">
                    <span>Allocate Stock</span>
                    <i className="bi bi-box-arrow-up"></i>
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
