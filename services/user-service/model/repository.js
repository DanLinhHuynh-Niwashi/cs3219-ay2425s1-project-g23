import UserModel from "./user-model.js";
import UserProfileModel from "./user-profile.js";
import mongoose from "mongoose";

import "dotenv/config";
import { connect } from "mongoose";

let retryCount = 0;
const reconnectMaxRetries = 5; // Max retries for reconnection after disconnection
const retryInterval = 5000; // Retry every 5 seconds

export async function connectToDB() {
  try {
    let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;
    console.log("mongoDBUri:", mongoDBUri)
    await connect(mongoDBUri);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error; // Will be caught by startServer() in the main code
  }
};

export const handleDBEvents = () => {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
    retryCount=0;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    // If disconnected, try to reconnect
    reconnectToDB();
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
    // If disconnected, try to reconnect
    reconnectToDB();
  });
};

const reconnectToDB = () => {
  console.log("Attempting to reconnect to MongoDB...");
  
  setTimeout(() => {
    if (retryCount==reconnectMaxRetries) {
      process.exit(1);
    }
    retryCount++;
    connectToDB().catch((err) => {
      console.error("MongoDB reconnection failed:", err);
      reconnectToDB(); // Retry reconnection
    });
  }, retryInterval); // Retry every 5 seconds
};


export async function createUser(username, email, password) {
  return new UserModel({ username, email, password }).save();
}

export async function createUserProfile({ userId, name, bio, gender, location, proficiency, github, linkedin }) {
  const userProfileData = {
    _id: userId,
    name: name,
  };

  if (bio) userProfileData.bio = bio;
  if (gender) userProfileData.gender = gender;
  if (location) userProfileData.location = location;
  if (proficiency) userProfileData.proficiency = proficiency;
  if (github) userProfileData.github = github;
  if (linkedin) userProfileData.linkedin = linkedin;

  // Create a new instance of UserProfileModel
  const userProfile = new UserProfileModel(userProfileData);
  return userProfile.save(); // This will save the user profile to the database
}


export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

export async function findUserById(userId) {
  return UserModel.findById(userId);
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [
      { username },
      { email },
    ],
  });
}

export async function findAllUsers() {
  return UserModel.find();
}

export async function findUserProfileById(userId) {
  return UserProfileModel.findOne({ _id: userId }).exec();
}

export async function updateUserById(userId, username, email, password) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function updateUserPassword(userId, password) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $set: { 
      password: password,
      }
    },
    { new: true }    
  );
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function updateUserProfileById(userId, profileData) {
  return UserProfileModel.findByIdAndUpdate(
    userId,
    { $set: { 
      ...profileData,
      }
    },
    { new: true }           // Return the updated profile
  );
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}
