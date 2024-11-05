import express from "express";

import {
  createUser,
  createUserProfile,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserPrivilege,
  updateUserProfile,
  resetPassword,
  getUserProfile,
  getUsernameById,
} from "../controller/user-controller.js";
import { verifyAccessToken, verifyIsAdmin, verifyIsOwnerOrAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getAllUsers);

router.patch("/:id/privilege", verifyAccessToken, verifyIsAdmin, updateUserPrivilege);

router.post("/", createUser);

router.post("/:id", createUserProfile);

router.get("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, getUser);

router.get("/:id/get-username", getUsernameById);


router.patch("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, updateUser);

router.delete("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, deleteUser);

router.post("/reset-password", resetPassword);

router.patch('/:id/user-profile/', updateUserProfile);

router.get('/:id/user-profile', verifyAccessToken, verifyIsOwnerOrAdmin, getUserProfile);

export default router;
