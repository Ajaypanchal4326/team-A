import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Login = () => {
    const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [remember, setRemember] = useState(false);
const [errors, setErrors] = useState({});

const validate =()=>{
  let newErrors = {};

  if(!email){
    newErrors.email = "Email is required";
  }
  else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if(!password){
      newErrors.password = "Password is required";
    }
    else if(password.length<6){
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
}

const hanleLogin =()=>{
if(validate()){
  navigate("/verify");
    }
  };
  return (
    
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Sign in to your Hire-a-Helper account</p>

        <label>Email Address</label>
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter your email" />
        {errors.email && <small className="error">{errors.email}</small>}

        <label>Password</label>
        <input type="password" value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="Enter your password" />
        {errors.password && <small className="error">{errors.password}</small>}

        <div className="auth-options">
          <label className="remember-me">
          <input type="checkbox" checked={remember} onChange={()=>setRemember(!remember)}/>
           Remember me
          </label>

          <Link to={"/forget-password"} className="forget-link">Forgot password?</Link>
        </div>

        <button onClick={hanleLogin}>Sign In</button>

        <div className="auth-footer">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};


export default Login;
