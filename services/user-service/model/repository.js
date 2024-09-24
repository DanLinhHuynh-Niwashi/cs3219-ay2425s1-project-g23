import UserModel from "./user-model.js";
import UserProfileModel from "./user-profile.js";
import mongoose from "mongoose";

import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;

  await connect(mongoDBUri);
}

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
