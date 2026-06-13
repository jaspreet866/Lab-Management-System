import { useEffect, useState } from "react";

export const Allocate = () => {
  const [labs, setlabs] = useState([]);
  const [selectedLab, setselectedLab] = useState("");
  const [issueDate, setissueDate] = useState("");
  const [quantity, setquantity] = useState("");
  const [allequip, setallequip] = useState([]);
  const [equipment, setequipment] = useState("");

  useEffect(() => {
    show();
    show2();
  }, []);

  const show = async () => {
    const result = await fetch("http://localhost:9000/api/getlab", {
      method: "get",
    });

    const res = await result.json();

    if (res.statuscode === 1) {
      setlabs(res.data);
    }
  };

  const show2 = async () => {
    const result = await fetch("http://localhost:9000/api/allequipments", {
      method: "get",
    });

    const res = await result.json();

    if (res.statuscode === 1) {
      setallequip(res.data);
    }
  };

  const upd = async (newquantity) => {
    const result = await fetch(
      `http://localhost:9000/api/updateequip/${equipment}`,
      {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newquantity }),
      },
    );

    const res = await result.json();

    if (res.statuscode === 1) {
      alert("Quantity Updated");
    } else {
      alert("Update failed");
    }
  };

  const allocate = async (e) => {
    e.preventDefault();

    const selectedEquipment = allequip.find((item) => item._id === equipment);

    if (!selectedEquipment) {
      alert("Select equipment");
      return;
    }

    if (selectedEquipment.Quantity < Number(quantity)) {
      alert("Not enough quantity available");
      return;
    }

    const result = await fetch("http://localhost:9000/api/allocate", {
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
      alert("Allocated");

      const remainingQuantity = selectedEquipment.Quantity - Number(quantity);

      await upd(remainingQuantity);

      // Refresh equipment list
      show2();
    } else {
      alert("Allocation failed");
    }
  };

  return (
    <>
      <section className="management-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-7">
              <div className="management-card shadow-sm">
                <p className="section-kicker">Equipment Issue</p>

                <h1>Allocate Equipment</h1>

                <p className="management-subtitle">
                  Select a lab, issue date, and quantity for allocation.
                </p>

                <form onSubmit={allocate}>
                  <div className="mb-3">
                    <label className="form-label">Select Lab</label>

                    <select
                      className="form-select management-select"
                      value={selectedLab}
                      onChange={(e) => setselectedLab(e.target.value)}
                    >
                      <option value="">Select Lab</option>

                      {labs.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.LabName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Select Equipment</label>

                    <select
                      className="form-select management-select"
                      value={equipment}
                      onChange={(e) => setequipment(e.target.value)}
                    >
                      <option value="">Select Equipment</option>

                      {allequip.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.EquipmentName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Issue Date</label>

                    <input
                      className="form-control"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setissueDate(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Quantity</label>

                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      value={quantity}
                      placeholder="Quantity"
                      onChange={(e) => setquantity(e.target.value)}
                    />
                  </div>

                  <button className="btn auth-btn w-100" type="submit">
                    Allocate
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
