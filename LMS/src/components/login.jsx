import { useState } from "react"
import { Link } from "react-router-dom"

export const Login=()=>{

    const[email,setemail]=useState("")
    const[pass,setpass]=useState("")

    const login=async(e)=>{
        e.preventDefault()
        const result=await fetch("http://localhost:9000/api/login",{
            method:"post",
            body:JSON.stringify({email,pass}),
            headers:{"Content-type":"application/json;charset=UTF-8"}
        })
        if(result){
            const res=await result.json()
            if(res.statuscode===1){
                alert("login successfully")
            }
            else if(res.statuscode==2){
                alert("admin is here")
            }
            else{
                alert("not")
            }
        }
    }

    return(
        <>
        <section className="auth-page">
            <div className="auth-shell container">
                <div className="auth-card row g-0 align-items-stretch">
                    <div className="col-lg-6">
                        <form className="form-panel">
                            <p className="section-kicker">Welcome back</p>
                            <h1>Login</h1>
                            <p className="auth-subtitle">Access your lab dashboard and manage equipment activity.</p>

                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input className="form-control" type="email" placeholder="Enter email" onChange={(e)=>setemail(e.target.value)} />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Password</label>
                                <input className="form-control" type="password" placeholder="Enter password" onChange={(e)=>setpass(e.target.value)} />
                            </div>

                            <button className="btn auth-btn w-100" onClick={login}>Login</button>
                        </form>
                    </div>

                    <div className="col-lg-6">
                        <div className="side-panel login-side">
                            <p className="section-kicker">Lab Management System</p>
                            <h2>Keep every lab request organized.</h2>
                            <p>
                                Sign in to issue equipment, track returns, and keep stock movement easy to follow.
                            </p>

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
