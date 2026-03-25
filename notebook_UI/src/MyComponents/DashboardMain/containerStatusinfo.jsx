import { useContext, useEffect } from "react";
import { NoteBookContext } from "../Dashboard/Dashboard";

function SystemStatusInfo(){
    const {name,ContainerName,userID}=useContext(NoteBookContext)
    const getSysStatusInfo= async ()=>{
        console.log("Running status info");
        
        try {
            const data=await fetch('http://127.0.0.1:8000/api/kernelinfo',{
                method:"POST",
                headers:{'content-Type':'application/json'},
                body:JSON.stringify({'notebookID':name})
            })
            const res=await data.json()
            console.log(".......");
            
            console.log(res);
        } catch (error) {

            console.log("Unble to Make a Request");
            
            
        }
    }

   
    return (
        <div>
            <button onClick={getSysStatusInfo}>check status</button>
        </div>
    )
}

export default SystemStatusInfo;