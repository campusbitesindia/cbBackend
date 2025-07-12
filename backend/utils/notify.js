const sendNotification = (roomId, payload) => {
    if (!global.io) return;
    global.io.to(roomId).emit("notification", payload);
};

module.exports = sendNotification;