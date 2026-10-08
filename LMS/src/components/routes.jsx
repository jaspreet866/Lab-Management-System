import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Login } from "./login"
import { Register } from "./register"
import { Sidebar } from "./sidebar"

// Pages behind sign-in are split out so the login screen does not ship the charts bundle
const Lab = lazy(() => import("./labs").then((m) => ({ default: m.Lab })))
const AddEquipment = lazy(() => import("./equipment").then((m) => ({ default: m.AddEquipment })))
const Allocate = lazy(() => import("./issue").then((m) => ({ default: m.Allocate })))
const Dashboard = lazy(() => import("./dashboard").then((m) => ({ default: m.Dashboard })))
const Return = lazy(() => import("./return").then((m) => ({ default: m.Return })))
const LabDash = lazy(() => import("./labdash").then((m) => ({ default: m.LabDash })))

const PageLoader = () => (
  <div className="page-loader" role="status">
    <div className="spinner-border text-primary" aria-hidden="true"></div>
    <span className="visually-hidden">Loading page...</span>
  </div>
)

export const Routee=()=>{
    return(
        <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Login></Login>}></Route>
        <Route path="/register" element={<Register></Register>}/>
        <Route path="/side" element={<Sidebar></Sidebar>}/>
        <Route path="/lab" element={<Lab></Lab>}/>
        <Route path="/equipment" element={<AddEquipment></AddEquipment>}/>
        <Route path="/allocate" element={<Allocate></Allocate>}/>
        <Route path="/dashboard" element={<Dashboard></Dashboard>}/>
        <Route path="/return" element={<Return></Return>}/>
        <Route path="/labdash" element={<LabDash></LabDash>}/>
        <Route path="*" element={<Navigate to="/" replace />}/>
    </Routes>
        </Suspense>
    )
}
