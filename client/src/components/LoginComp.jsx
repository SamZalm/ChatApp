import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Typography, Box, Link } from "@mui/material";

export const LoginComp = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    
    const sendToAPI = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/auth/login", {
                username,
                password,
            });
            //console.log(response);
            if (response.data.status === "success") {
                localStorage.setItem("token", response.data.data); // save to localStorage
                //console.log(localStorage.getItem("token"));
                navigate("/chat"); // Move to chat
            } else {
                setError(response.data); // Display error message if login fails
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username === "" || password === "") {
            setError("All fields must be filled!");
        } else {
            sendToAPI();
        }
    };

    return (
        <Box sx={{ maxWidth: 400, margin: "auto", padding: 3, backgroundColor: (theme) => theme.palette.background.paper, borderRadius: '10px'}}>
            <Typography variant="h4" gutterBottom align="center">Login</Typography>
            {error && (
                <Typography color="error" variant="body2" align="center" sx={{ marginBottom: 2 }}>
                    {error}
                </Typography>
            )}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    sx={{ marginBottom: 2 }}
                />
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{ marginBottom: 2 }}
                />
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{ marginBottom: 2 }}
                >
                    Login
                </Button>
            </form>
            <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2">
                    Don't have an account?{" "}
                    <Link href="/register" underline="hover" sx={{ fontWeight: "bold" }}>
                        Register here
                    </Link>
                </Typography>
                {/* <Typography variant="body2" sx={{ marginTop: 1 }}>
                    <Link href="/forgot-password" underline="hover" sx={{ fontWeight: "bold" }}>
                        Forgot your password?
                    </Link>
                </Typography> */}
            </Box>
        </Box>
    );
};

export default LoginComp;
