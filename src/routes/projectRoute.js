var express = require("express");
var router = express();

router.use(
    express.urlencoded({
        extended: true,
    })
);
router.use(
    express.json({
        limit: 100000000,
        extended: true,
    })
);

/* import controller files into route file to trigger the request methods.*/
const _projectController = require("../controllers/project.controller");

/* Defining the Routes for different API's */
router.get("/getprojectlist", _projectController.getProjectDataList);
router.post("/addproject", _projectController.addNewProject);
router.post("/deleteproject", _projectController.deleteProjectById);

module.exports = {
    router
};