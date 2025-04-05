import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import BackButton from '../BackButton';
import axios from 'axios';

function CreateCall() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState();

    const generate_code = async () => {
        try {
            const response = await axios.get('http://localhost:8000/generate-code');
            setRoomCode(response.data.generated_code);
        }
        catch (e) {
            alert("Error generating code", e);
        }
    }

    const delete_room = async () => {
        if (!roomCode) {
            console.warn("roomCode is not defined yet");
            return;
          }
        
        try {
            const response = await axios.delete(`http://localhost:8000/delete-code/${roomCode}`)
            console.log(response.data.message)
        }
        catch (e) {
            alert("Error deleteing code", e.message);
            console.log(e.message)
        }
    }

    useEffect(() => {
        generate_code()
        return () => {
            if (roomCode) {
              axios.delete(`http://localhost:8000/delete-code/${roomCode}`)
                .then(res => console.log('Room deleted:', res.data.message))
                .catch(err => console.error('Failed to delete room:', err))
            }
          }
    }
    , []);
  
    return (
      <>    
        <div className='flex flex-col gap-10'>
            <a onClick={delete_room}>
                <BackButton text="(destroy room)"/>
            </a>

            <h1>Room Code: {roomCode}</h1>
            <h2>Waiting for user...</h2>
        </div>
        
      </>
    )
  }
  
  export default CreateCall