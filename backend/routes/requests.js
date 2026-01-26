const express = require("express");
const router = express.Router();
const validator = require("validator");
const { createRequest, getReceivedRequests, updateRequestStatus } = require("../handlers/requests-handler");

router.post("/:taskId/send", async (req, res) => {
    try {
        const { taskId } = req.params;
        if (!validator.isUUID(taskId)) {
            return res.status(400).json({ message: "Invalid Task ID" });
        }
        const model = req.body;
        const result = await createRequest(
            model,
            taskId,
            req.user._id,
            req.user.first_name + " " + req.user.last_name
        );
        return res.status(result.status).json({ message: result.message, requestId: result.requestId });
    } catch (err) {
        console.error("Create Request Route error:", err);
        return res.status(500).json({ message: "Something went wrong while creating your request." });
    }
});

router.get("/received", async (req, res) => {
    try {
        const result = await getReceivedRequests(req.user._id);
        return res.status(result.status).json(result.data);
    } catch (err) {
        console.error("Get Received Requests Route error:", err);
        return res.status(500).json({ message: "Failed to fetch requests" });
    }
});

router.put("/:requestId", async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const result = await updateRequestStatus(
            requestId,
            status,
            req.user._id
        );

        return res.status(result.status).json({ message: result.message });
    } catch (err) {
        console.error("Update Request Status Route error:", err);
        return res.status(500).json({ message: "Failed to update request" });
    }
});

module.exports = router;