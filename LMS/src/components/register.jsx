import { Link } from "react-router-dom"

export const Register=()=>{



    return(
        <>
         <section className="auth-page">
            <div className="auth-shell container">
                <div className="auth-card row g-0 align-items-stretch">
                    <div className="col-lg-6">
                        <form className="form-panel">
                        <p className="section-kicker">Get started</p>
                        <h1>Register</h1>
                        <p className="auth-subtitle">Create your account to manage lab equipment requests.</p>

                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Name"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                        
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                    
                            />

                        </div>

                        <button
                            className="btn auth-btn w-100"
                            type="submit"
                        >
                            Register
                        </button>
                        </form>
                    </div>


                    <div className="col-lg-6">
                        <div className="side-panel">
                            <p className="section-kicker">Lab Management System</p>
                            <h2>Create your account</h2>

                            <p>
                                Register to issue equipment, review returns, and keep lab records accurate.
                            </p>

                            <ul className="auth-list">
                                <li>Easy equipment requests</li>
                                <li>Clear return tracking</li>
                                <li>Faster lab check-ins</li>
                            </ul>

                            <div className="auth-highlight">
                                <span>Already have an account?</span>
                                <Link className="btn auth-outline-btn" to="/login">Login</Link>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
            </section>
        </>
    )
}
