import { useState } from 'react'
import TestSystem from '../TestSystem'
import { useNavigate } from 'react-router-dom';

function Home() {
    const [showComponent, setShowComponent] = useState(false);
    const navigate = useNavigate();

    const redirectToCreateCall = () => {
      navigate("/createCall");
    }
    
    const redirectToJoinCall = () => {
      navigate("/joinCall");
    }

    return (
      <>
        <div className='flex flex-col gap-10'>
          <button 
            onClick={() => {setShowComponent(true)}}
            className='bg-black px-4 py-2 rounded'>
          Create test system
          </button>
            
          {showComponent && <TestSystem />}
  
          <div className="flex flex-col gap-10">
            <button className="bg-green-600 fill-green-600" onClick={redirectToCreateCall}>Create Call</button>
            <button className="bg-blue-600" onClick={redirectToJoinCall}>Join Call</button>
          </div>
        </div>
        
      </>
    )
  }
  
  export default Home