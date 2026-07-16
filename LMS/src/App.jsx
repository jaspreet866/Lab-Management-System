
import { useEffect, useState } from 'react'
import './App.css'
import { Context } from './components/context'
import { Header } from './components/header'
import { Routee } from './components/routes'

function App() {

const[usertype,setusertype]=useState(" ")


 useEffect(() => {
    const ut = localStorage.getItem("Utype");
    if(ut=="Admin"){
      setusertype("Admin")
    }
    else{
      setusertype("User")
    }
  
}, []);


  return (
    <>
     <Context.Provider value={{usertype,setusertype}}>
      <Header></Header>
      <Routee></Routee>
     </Context.Provider>
    </>
  )
}

export default App
