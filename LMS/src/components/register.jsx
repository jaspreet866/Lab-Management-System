import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";

export const Register = () => {
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [pass, setpass] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scale and fade card in
      gsap.fromTo(".auth-card",
        { opacity: 0, y: 40, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      );

      // Stagger form contents
      gsap.fromTo(".form-panel > *",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.2 }
      );

      // Stagger side panel contents from right
      gsap.fromTo(".side-panel > *",
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.3 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const register = async (e) => {
    e.preventDefault();
    if (!name || !email || !pass) {
      alert("Please fill in all fields");
      return;
    }
    const result = await fetch("http://localhost:9000/api/register", {
      method: "post",
      body: JSON.stringify({ name, email, pass }),
      headers: { "Content-type": "application/json;charset=UTF-8" },
    });
    if (result.ok) {
      const res = await result.json();
      if (res.statuscode === 1) {
        alert("Registered successfully!");
      } else {
        alert("Registration failed");
      }
    }
  };

  return (
    <>
      <section className="auth-page" ref={containerRef}>
        <div className="auth-shell container">
          <div className="auth-card row g-0 align-items-stretch">
            <div className="col-lg-6">
              <form className="form-panel" onSubmit={register}>
                <p className="section-kicker">Get started</p>
                <h1>Register</h1>
                <p className="auth-subtitle">
                  Create your account to manage lab equipment requests.
                </p>

                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-person text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setemail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="••••••••"
                      value={pass}
                      onChange={(e) => setpass(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2" type="submit">
                  <span>Register</span>
                  <i className="bi bi-person-plus"></i>
                </button>
              </form>
            </div>

            <div className="col-lg-6">
              <div className="side-panel">
                <p className="section-kicker text-white opacity-75">Lab Management System</p>
                <h2>Create your account</h2>

                <p>
                  Register to issue equipment, review returns, and keep lab
                  records accurate.
                </p>

                <ul className="auth-list">
                  <li>Easy equipment requests</li>
                  <li>Clear return tracking</li>
                  <li>Faster lab check-ins</li>
                </ul>

                <div className="auth-highlight">
                  <span>Already have an account?</span>
                  <Link className="btn auth-outline-btn" to="/">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
