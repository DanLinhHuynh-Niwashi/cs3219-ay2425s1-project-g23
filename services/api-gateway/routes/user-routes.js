import dotenv from 'dotenv';
import express from "express";
import { handleHttpCredentialRequest, handleLoginRequest } from "../controllers/gateway-controller.js";

dotenv.config();

const base_url = process.env.USER_URL;
const port = process.env.USER_PORT || 3002;

const userRoutes = express.Router();

// User routes
userRoutes.get("/users", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, "/users"));
userRoutes.get("/users/:id", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, `/users/${req.params.id}`));
userRoutes.get("/users/:id/user-profile", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, `/users/${req.params.id}/user-profile`));
userRoutes.get("/auth/verify-token", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, "/auth/verify-token"));
userRoutes.get("/users/:id/get-username",(req, res) => handleHttpCredentialRequest(req, res, base_url, port, `/users/${req.params.id}/get-username`));
userRoutes.post("/users", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, "/users"));
userRoutes.post("/users/reset-password", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, "/users/reset-password"));
userRoutes.post("/auth/login", (req, res) => handleLoginRequest(req, res, base_url, port, "/auth/login"));
userRoutes.post("/users/:id", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, `/users/${req.params.id}`));
userRoutes.patch("/users/:id", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, `/users/${req.params.id}`));
userRoutes.patch("/users/:id/privilege", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, `/users/${req.params.id}/privilege`));
userRoutes.patch("/users/:id/user-profile", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, `/users/${req.params.id}/user-profile`));

userRoutes.delete("/users/:id", (req, res) => handleHttpCredentialRequest(req, res, base_url, port, `/users/${req.params.id}`));

export default userRoutes;
