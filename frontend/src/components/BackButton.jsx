import { useNavigate } from 'react-router-dom';

function BackButton(props) {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <button 
            onClick={handleGoBack} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
        >
            Go Back {props.text && props.text}
        </button>
    );
}

export default BackButton; 