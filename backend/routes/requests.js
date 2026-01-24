const express = require("express");
const router = express.Router();
const validator = require("validator");
const {createRequest} = require("../handlers/requests-handler");

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
            req.user.first_name+" "+req.user.last_name
        );
        return res.status(result.status).json({ message: result.message, requestId: result.requestId });
     }catch (err) {
        console.error("Create Request Route error:", err);
        return res.status(500).json({ message: "Something went wrong while creating your request." });
    }
});

module.exports = router;