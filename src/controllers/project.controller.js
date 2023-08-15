var client = require("../config/postgresDB.config");
var Joi = require("joi");


getProjectDataList = (req, res, next) => {
    // const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.perpage);
    const offset = parseInt(req.query.offset);
    // const offset = (page - 1) * limit;   

    const countResult = 'SELECT COUNT(*) FROM _tblProjects';
    let totalCount;
    client.query(countResult, (err, result) => {
        if (err) {
            throw err;
        }
        else {
            totalCount = result.rows[0].count;
        }
    })

    const query = `SELECT * FROM _tblProjects ORDER BY prject_id LIMIT $1 OFFSET $2`;
    const values = [limit, offset]

    client.query(query, values, (err, result) => {
        if (err) {
            if (err.detail) {
                console.log(err);
                res.json({
                    error: "failed_to_load_response",
                });
            }
        } else {            
            {
                res.status(200).json({
                    statusCode: 200,
                    message: "project_list",
                    // currentPage: page,
                    offset: offset,
                    perpage: limit,
                    total: Number(totalCount),
                    data: result.rows,
                });
            }

        }
    });
    // }
};

addNewProject = (request, response, next) => {
    const _newProjectParams = Joi.object({
        project_title: Joi.string().required(),
        project_type: Joi.string().required(),
        project_status: Joi.string().required(),
        project_client: Joi.string().required(),
        project_assigned_manager: Joi.string().required(),
        project_assigned_developers: Joi.array().required(),
        sprint_planned: Joi.string().required(),
        project_cost: Joi.string().required(),
        currency: Joi.string().required(),
        project_start_date: Joi.string().required(),
        project_completion_date: Joi.string().required()
    });

    const { error } = _newProjectParams.validate(request.body);
    if (error) {
        response.status(400).json({
            code: 400,
            message: error.details[0].message,
        });
        response.end(data);
    }
    else {
        console.log(request.body)
        project_title = request.body.project_title;
        project_type = request.body.project_type;
        project_status = request.body.project_status;
        project_client = request.body.project_client;
        project_assigned_manager = request.body.project_assigned_manager;
        project_assigned_developers = request.body.project_assigned_developers;
        sprint_planned = request.body.sprint_planned;
        project_cost = request.body.project_cost;
        currency = request.body.currency;
        project_start_date = request.body.project_start_date;
        project_completion_date = request.body.project_completion_date
        created_at = getCurrentDateTime();
        updated_at = getCurrentDateTime();

        const text =
            `INSERT INTO _tblProjects
            (
            project_title,
            project_type,
            project_status,
            project_client,
            project_assigned_manager,
            project_assigned_developers,
            sprint_planned,
            project_cost,
            currency,
            project_start_date,
            project_completion_date,
            created_at,
            updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
        const values = [
            project_title,
            project_type,
            project_status,
            project_client,
            project_assigned_manager,
            project_assigned_developers,
            sprint_planned,
            project_cost,
            currency,
            project_start_date,
            project_completion_date,
            created_at,
            updated_at
        ];
        // callback
        client.query(text, values, (err, result) => {
            if (err) {
                if (err.detail) {
                    console.log(err);
                    response.status(409).json({
                        statusCode: 409,
                        error: "something_went_wrong",
                    });
                }
            } else {
                response.status(200).json({
                    statusCode: 200,
                    message:
                        "project_added_successfully",
                });
            }
        });
    }

}

deleteProjectById = (request, response, next) => {
    const _projectIdObj = Joi.object({
        prject_id: Joi.number().required()
    });

    const { error } = _projectIdObj.validate(request.body);
    if (error) {
        response.status(400).json({
            code: 400,
            message: error.details[0].message,
        });
        response.end(data);
    } else {
        prject_id = request.body.prject_id;
        console.log(prject_id);
        const _queryText = `DELETE FROM _tblProjects WHERE prject_id = $1`;
        const _values = [prject_id];
        client.query(_queryText, _values, (err, result) => {
            if (err) {
                console.error('Error deleting record:', err);
                response.status(500).json({
                    statusCode: 500,
                    message: "something_went_wrong"
                });
            } else {
                response.status(200).json({
                    statusCode: 200,
                    message: "project_deleted_successfully"
                });
            }
        });
    }
}

/* getting current date & time */
function getCurrentDateTime() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return (
        year +
        "-" +
        month +
        "-" +
        date +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
    );
    // return date_ob
}

module.exports = {
    getProjectDataList,
    addNewProject,
    deleteProjectById
}
