import React,{useState} from "react";
import "../styles/auth.css";
import { Link, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
const navigate = useNavigate();
const [code, setCode] = useState("");
  const [error, setError] = useState("");

const handleVerify = () => {
    if (!/^\d{6}$/.test(code)) {
      setError("Enter a valid 6-digit code");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <p>Enter the 6-digit code sent to your email</p>

        <label>Verification Code</label>
        <input type="text" value={code} placeholder="000000" onChange={(e) => setCode(e.target.value)} />
        {error && <small className="error">{error}</small>}


        <button onClick={handleVerify}>Verify Code</button>

        <div className="auth-footer">
  Didn’t receive code?
 <Link to="/">Resend</Link> 
</div>

      </div>
    </div>
  );
};

export default VerifyEmail;
