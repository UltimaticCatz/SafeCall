import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import BackButton from '../BackButton';

function Home() {
    const navigate = useNavigate();

    const redirectToCreateCall = () => {
      
    }
  
    return (
      <>
        <div className='flex flex-col gap-10'>
            <BackButton />
    
            <div className="flex flex-col gap-10">
                <button className="bg-green-600 fill-green-600" onClick={redirectToCreateCall}>Create Call</button>
                <button className="bg-blue-600">Join Call</button>
            </div>
        </div>
        
      </>
    )
  }
  
  export default Home