import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Signup = () => {
  const navigate = useNavigate();

  const [form,setForm] = useState({
    firstName:"",
    lastName:"",
    email:"",
    phone:"",
    password:"",
  });

const [errors,setErrors] = useState({});

  const handleChange = (e) =>{
    setForm({...form, [e.target.name]:e.target.value})
  };

  const validate = () => {
    let newErrors = {};

    if (!form.firstName) newErrors.firstName = "First name required";
    if (!form.lastName) newErrors.lastName = "Last name required";

    if (!form.email) {
      newErrors.email = "Email required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!form.phone) {
      newErrors.phone = "Phone number required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Enter 10 digit number";
    }

    if (!form.password) {
      newErrors.password = "Password required";
    } else if (form.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
  if(validate()){
    navigate("/verify");
  }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join the Hire-a-Helper community</p>

       
        <div className="two-col">
          <div className="input-group">
            <label>First Name</label>
            <input name="firstName" type="text" placeholder="First Name" onChange={handleChange}/>
             {errors.firstName && <small className="error">{errors.firstName}</small>}
          </div>

          <div className="input-group">
            <label>Last Name</label>
            <input name="lastName"
 type="text" placeholder="Last Name" onChange={handleChange} />
      {errors.lastName && <small className="error">{errors.lastName}</small>}
          </div>
        </div>

        
        <div className="input-group">
          <label>Email Address</label>
          <input  name="email" type="email" placeholder="Enter your email" onChange={handleChange} />
           {errors.email && <small className="error">{errors.email}</small>}

        </div>

        <div className="input-group">
          <label>Phone Number</label>
           <input name="phone" placeholder="Phone Number" onChange={handleChange} />
        {errors.phone && <small className="error">{errors.phone}</small>}
        </div>


     
        <div className="input-group">
          <label>Password</label>
          <input  name="password" type="password" placeholder="Create your password"  onChange={handleChange} />
          {errors.password && <small className="error">{errors.password}</small>}
        </div>

        <button className="primary-btn" onClick={handleSignup}>
          Create Account
        </button>

        <div className="auth-footer">
          Already have an account? <Link to="/verify">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
