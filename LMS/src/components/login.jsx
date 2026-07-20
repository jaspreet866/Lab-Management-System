import { useContext, useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { Context } from "./context"
import { gsap } from "gsap"

export const Login=()=>{

    const[email,setemail]=useState("")
    const[pass,setpass]=useState("")
    const navigate=useNavigate("")
    const {usertype,setusertype}=useContext(Context)
    const containerRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animating the overall card container
            gsap.fromTo(".auth-card", 
                { opacity: 0, y: 40, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
            );

            // Stagger form items (kicker, h1, subtitle, input groups, buttons)
            gsap.fromTo(".form-panel > *",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.2 }
            );

            // Stagger side panel contents from the right
            gsap.fromTo(".side-panel > *",
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.3 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const login=async(e)=>{
        e.preventDefault()
        if (!email || !pass) {
            alert("Please fill in all fields")
            return
        }
        const result=await fetch(""https://lab-management-system-n3i5.onrender.com/api/login",{
            method:"post",
            body:JSON.stringify({email,pass}),
            headers:{"Content-type":"application/json;charset=UTF-8"}
        })
        if(result){
            const res=await result.json()
            if(res.statuscode===1){
                alert("Login successfully as User")
                setusertype("User")
                localStorage.setItem("Utype", "User")
                navigate("/dashboard")
            }
            else if(res.statuscode==2){
                alert("Login successfully as " + res.utype)
                navigate("/dashboard")
                setusertype("Admin")
                localStorage.setItem("Utype",res.utype)
            }
            else{
                alert("Invalid email or password")
            }
        }
    }

    return(
        <>
        <section className="auth-page" ref={containerRef}>
            <div className="auth-shell container">
                <div className="auth-card row g-0 align-items-stretch">
                    <div className="col-lg-6">
                        <form className="form-panel" onSubmit={login}>
                            <p className="section-kicker">Welcome back</p>
                            <h1>Login</h1>
                            <p className="auth-subtitle">Access your lab dashboard and manage equipment activity.</p>

                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-envelope text-muted"></i>
                                    </span>
                                    <input 
                                        className="form-control border-start-0 ps-0" 
                                        type="email" 
                                        placeholder="name@example.com" 
                                        value={email}
                                        onChange={(e)=>setemail(e.target.value)} 
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
                                        className="form-control border-start-0 ps-0" 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={pass}
                                        onChange={(e)=>setpass(e.target.value)} 
                                        required
                                    />
                                </div>
                            </div>

                            <button className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2" type="submit">
                                <span>Sign In</span>
                                <i className="bi bi-arrow-right"></i>
                            </button>
                        </form>
                    </div>

                    <div className="col-lg-6">
                        <div className="side-panel">
                            <p className="section-kicker text-white opacity-75">Lab Management System</p>
                            <h2>Keep every lab request organized.</h2>
                            <p>
                                Sign in to issue equipment, track returns, and keep stock movement easy to follow.
                            </p>

                            <ul className="auth-list">
                                <li>Real-time inventory updates</li>
                                <li>Track allocations by laboratory</li>
                                <li>Report damage or part issues instantly</li>
                            </ul>

                            <div className="auth-highlight">
                                <span>New here?</span>
                                <Link className="btn auth-outline-btn" to="/register">Create account</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}
