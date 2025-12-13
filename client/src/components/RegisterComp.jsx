import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Typography, Box, Link, InputLabel, Input, FormControl, IconButton } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

export const RegisterComp = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getImageUrl = async (fileData) => {
        try {
            const formData = new FormData();
            formData.append('image', fileData[0]);
            const response = await axios.post(
                "http://localhost:3000/api/media/upload", formData,
                { 
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            if (response.data === "No file uploaded.") {
                return null;
            } else {
                return response.data; // The image URL from the API
            }
        } catch (error) {
            console.log(error)
            setError("Something went wrong. Please try again.");
        }
    };

    const sendToAPI = async (profilePicURL) => {
        try {
            const response = await axios.post(
                "http://localhost:3000/api/auth/register",
                {
                    username,
                    email,
                    password,
                    profilePicture: profilePicURL
                }
            );
            if (response.data === "User Created!") {
                navigate("/login");
                //setError(response.data);
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username === "" || email === "" || password === "" || confirmPass === "") {
            setError("All fields must be filled!");
        } else {
            if (password === confirmPass) {
                let profilePicUrl = null;
                if (files.length > 0) {
                    // If a file is selected, upload and get the URL
                    profilePicUrl = await getImageUrl(files);
                }
                sendToAPI(profilePicUrl);
            } else {
                setError("Passwords do not match!");
            }
        }
    };

    return (
        <Box sx={{ maxWidth: 400, margin: "auto", padding: 3, backgroundColor: (theme) => theme.palette.background.paper, borderRadius: '10px' }}>
            <Typography variant="h4" gutterBottom align="center">Register</Typography>
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
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <TextField
                    label="Confirm Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    sx={{ marginBottom: 2 }}
                />
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel htmlFor="imageFile">Profile Picture: (Optional)</InputLabel>
                    <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFiles(e.target.files)}
                        startAdornment={
                            <IconButton>
                                <CloudUpload />
                            </IconButton>
                        }
                    />
                </FormControl>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ marginBottom: 2 }}
                >
                    Register
                </Button>
            </form>

            <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2">
                    Already have an account?{" "}
                    <Link href="/login" underline="hover" sx={{ fontWeight: "bold" }}>
                        Login here
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default RegisterComp;
