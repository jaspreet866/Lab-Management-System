import { Sidebar } from "./sidebar"

export const Dashboard=()=>{




    return(
        <>
        <div className="container">
            <div className="row">
                <div className="col col-lg-4"><Sidebar></Sidebar></div>
                <div className="col">
                    <div className="row">
                        <div className="col"></div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}