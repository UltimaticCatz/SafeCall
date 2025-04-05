import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import BackButton from '../BackButton';
import axios from 'axios';

function JoinCall() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState("");
    const [allRoomCodes, setAllRoomCodes] = useState([]);

    const fetchAllRoomCodes = async () => {
        try {
            const response = await axios.post("http://localhost:8000/code-list");
            setAllRoomCodes(response.data.code_list);
        }
        catch (e) {
            console.log("error fetching response ", e);
        }
        
    }

    const handleInputChange = (e) => {
        setRoomCode(e.target.value);
    }

    const isInputValid = () => {
        return roomCode && true;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (allRoomCodes.includes(roomCode)) {
            alert("room found, joining ");
            console.log(`joining room ${roomCode}.`)
            //rtc connection stuff here
            //
        }
        else {
            alert("Room not found! Enter a new code");
            setRoomCode("");
        }
        
    }
    useEffect(() => {
        fetchAllRoomCodes();
    }
    , []);
  
    return (
      <>    
        <div className='flex flex-col gap-10'>  
            <BackButton/>


            <h1>Enter Room Code:</h1>
            <form onSubmit={handleSubmit}>
                <input placeholder='Room Code' value={roomCode} onChange={handleInputChange} className='border rounded-2xl text-center'></input>
                <button type="submit" disabled={!isInputValid()}>Join</button>
            </form>
            
            
        </div>
        
      </>
    )
  }
  
  export default JoinCall