import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";
import {
  createUser as _createUser,
  createUserProfile as _createUserProfile,
  deleteUserById as _deleteUserById,
  findAllUsers as _findAllUsers,
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  findUserByUsername as _findUserByUsername,
  findUserByUsernameOrEmail as _findUserByUsernameOrEmail,
  updateUserById as _updateUserById,
  updateUserPrivilegeById as _updateUserPrivilegeById,
  findUserProfileById as _findUserProfileById,
  updateUserProfileById as _updateUserProfileById,
  findUserByEmail,
} from "../model/repository.js";
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail as _sendResetPasswordEmail} from "../utils/email-password.js"; 
import { validatePassword as _validatePassword} from "../utils/password-strength.js";

export async function createUser(req, res) {
  try {
    const { username, email, password } = req.body;
    if (username && email && password) {
      const existingUser = await _findUserByUsernameOrEmail(username, email);
      if (existingUser) {
        return res.status(409).json({ message: "username or email already exists" });
      }

      const { isValid, error } = _validatePassword(password);
      if (!isValid) {
        return res.status(400).json({ message: error.join(" ") });
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const createdUser = await _createUser(username, email, hashedPassword);
      return res.status(201).json({
        message: `Created new user ${username} successfully`,
        data: formatUserResponse(createdUser),
      });
    } else {
      return res.status(400).json({ message: "username and/or email and/or password are missing" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when creating new user!" });
  }
}

export async function createUserProfile(req, res) {
  try {
    const userId = req.params.id;
    const { name, bio, gender, location, proficiency, github, linkedin } = req.body;

    if (name) {
      // Check if the user exists
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user profile already exists
      const existingProfile = await _findUserProfileById(userId);
      if (existingProfile) {
        return res.status(409).json({ message: "User profile already exists" });
      }

      const errors={};
  
      if (gender && !["Male", "Female", "Others"].includes(gender)) {
        errors.gender = "Gender must be Male, Female, or Others.";
      }
  
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: "Validation errors", errors});
      }

      const newProfile = await _createUserProfile({ userId, name, bio, gender, location, proficiency, github, linkedin });
      
      return res.status(201).json({
        message: "User profile created successfully",
        data: newProfile,
      });
    } else {
      return res.status(400).json({ message: "Name is required." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating user profile" });
  }
}

export async function getUsernameById(req, res) {
  try {
    const userId = req.params.id;
    
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const user = await _findUserById(userId).select('username'); // Fetch only the username
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    } else {
      return res.status(200).json({ message: `Found user`, data: { username: user.username } });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting username!" });
  }
}

export async function getUser(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    } else {
      return res.status(200).json({ message: `Found user`, data: formatUserResponse(user) });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting user!" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await _findAllUsers();

    return res.status(200).json({ message: `Found users`, data: users.map(formatUserResponse) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting all users!" });
  }
}

export async function updateUser(req, res) {
  try {
    const { username, email, password } = req.body;
    if (username || email || password) {
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      if (username || email) {
        let existingUser = await _findUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ message: "username already exists" });
        }
        existingUser = await _findUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ message: "email already exists" });
        }
      }

      let hashedPassword;
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(password, salt);
      }
      const updatedUser = await _updateUserById(userId, username, email, hashedPassword);
      return res.status(200).json({
        message: `Updated data for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "No field to update: username and email and password are all missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user!" });
  }
}

export async function updateUserPrivilege(req, res) {
  try {
    const { isAdmin } = req.body;

    if (isAdmin !== undefined) {  // isAdmin can have boolean value true or false
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      const updatedUser = await _updateUserPrivilegeById(userId, isAdmin === true);
      return res.status(200).json({
        message: `Updated privilege for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "isAdmin is missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user privilege!" });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }
    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    await _deleteUserById(userId);
    return res.status(200).json({ message: `Deleted user ${userId} successfully` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when deleting user!" });
  }
}

export async function resetPassword(req, res) {
  try {
    const{ email } = req.body;

    const user = await _findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: `User with this email (${email}) does not exist.`});
    }

    // Create a reset token (valid for 5 minutes)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "5m" });

    const mail = await _sendResetPasswordEmail(email, token);
    if (mail) {
      return res.status(200).json({ message: `Password reset link sent to your email ${email}.`});
    }
  } catch (err) {
    console.error("Error sending reset email:", err);
    return res.status(500).json({ message: "Error sending reset email."});
  }
}

// Update user profile
export async function updateUserProfile(req, res) {
  try {
    const userId = req.params.id; // Get userId from request parameters
    const profileData = req.body; // Get the profile data from the request body

    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const userProfile = await _findUserProfileById(userId); // Assume this function checks if the profile exists
    if (!userProfile) {
      return res.status(404).json({ message: `Profile for user ${userId} not found` });
    }

    const errors={};

    if (!profileData.name || profileData.name.trim() == "") {
      errors.name = "Name is required.";
    }

    if (profileData.gender && !["Male", "Female", "Others"].includes(profileData.gender)) {
      errors.gender = "Gender must be Male, Female, or Others.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation errors", errors});
    }

    const updatedProfile = await _updateUserProfileById(userId, profileData); // Update the profile

    return res.status(200).json({
      message: `User profile updated successfully for user ${userId}`,
      data: updatedProfile,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user profile!" });
  }
}

export async function getUserProfile(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const userProfile = await _findUserProfileById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: `User profile not found` });
    } else {
      return res.status(200).json({ message: `Found user profile`, data: formatProfileResponse(userProfile) });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting user profile!" });
  }
}

export function formatUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };
}

export function formatProfileResponse(profile) {
  return {
    name: profile.name,
    bio: profile.bio,
    gender: profile.gender,
    location: profile.location,
    proficiency: profile.proficiency,
    linkedin: profile.linkedin,
    github: profile.github,
  }
}
