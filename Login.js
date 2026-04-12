import React, { useState } from "react";

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{isSignup ? "Create Account" : "Login"}</h2>

      <input placeholder="Email" /><br/><br/>
      <input type="password" placeholder="Password" /><br/><br/>

      {isSignup && <input placeholder="Hospital Name" /><br/><br/>}

      <button onClick={onLogin}>
        {isSignup ? "Sign Up" : "Login"}
      </button>

      <p>
        {isSignup ? "Already have an account?" : "New user?"}
        <button onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Login" : "Create Account"}
        </button>
      </p>
    </div>
  );
}

export default Login;
