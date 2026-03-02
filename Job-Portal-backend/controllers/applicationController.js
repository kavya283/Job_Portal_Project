const Application = require("../models/Application");


exports.myApplications = async (req, res) => {
const apps = await Application.find({ candidate: req.user.id })
.populate("job", "title company location");
res.json(apps);
};