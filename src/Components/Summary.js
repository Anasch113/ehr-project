import React from 'react'
import { useLocation } from 'react-router-dom';
import "../Styles/summary.css"
const Summary = () => {
    const location = useLocation();
    const summary = JSON.parse(location.state?.summary || '{}');


  //  useEffect(()=>{
  //   sendSummaryToAPI(summary)
  //  }, [summary])
   
  return (
    <div className='summary-container'>
      <h2  className="py-6 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 text-center text-4xl ">Summary</h2>
      
      <ul className="bg-blue-100 chatbox  px-20 overflow-y-auto scroll-smooth pt-5 pb-32 rounded-3xl max-w-screen-xl w-full h-[80vh]">
        
        {Object.entries(summary).map(([key, value]) => (
          <li className='summary-chats' key={key}>
            <strong className='ai-sum-box'>{key}:</strong> <span className='user-sum-box'>{value}</span> 
          </li>
        ))}
      </ul>
    </div>
    
  )
}

export default Summary
