export async function calculateSessionDuration(leavingUserWs, partnerUserId) {
    // You'd need access to `joinTime` and `leaveTime` for both users
    const joinTime = leavingUserWs.joinTime;
    const leaveTime = leavingUserWs.leaveTime || new Date(); // Current time if not set

    // Calculate duration
    const durationMs = new Date(leaveTime) - new Date(joinTime);

    // Convert ms to hours, minutes, seconds
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    return `${hours}:${minutes}:${seconds}`;
}
