import SessionSummaryModel from "./session-summary.js";
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
    let mongoDBUri =
        process.env.ENV === "PROD"
        ? process.env.DB_CLOUD_URI
        : process.env.DB_LOCAL_URI;
    console.log("mongdoDBUri:", mongoDBUri);
    await connect(mongoDBUri);
}

export async function getSessionSummary(sessionId) {
    return await SessionSummaryModel.findOne({ sessionId }).lean();
}