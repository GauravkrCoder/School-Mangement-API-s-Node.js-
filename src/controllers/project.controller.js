var client = require("../config/postgresDB.config");
var Joi = require("joi");


function excludeUndefinedQueryParams(_projctTitle, _prjctType, _clientName, _prjctMngr, _sprntPln, _status) {
    const queryParams = [];
    let whereClause = '';
    if (_projctTitle !== undefined) {
        whereClause += 'project_title = $1';
        queryParams.push(project_title);
    }
    if (_prjctType !== undefined) {
        if (whereClause !== '') {
            whereClause += ' AND ';
        }
        whereClause += 'project_type = $' + (queryParams.length + 1);
        queryParams.push(_prjctType);
    }
    return queryParams;
}

getProjectDataList = (req, res, next) => {
    try {
        const { project_title, project_type, perpage, offset } = req.query;
        const isFilteredData = ['project_title', 'project_type'];
        let totalCount;
        const countResult = 'SELECT COUNT(*) FROM _tblProjects';
        client.query(countResult, (err, result) => {
            if (err) {
                throw err;
            }
            else {
                totalCount = result.rows[0].count;
            }
        })

        let query = `SELECT * FROM _tblProjects`;
        const queryParams = [];
        let whereClause = '';
        // excludeUndefinedQueryParams(project_title, project_type, perpage, offset)

        if (project_title !== undefined) {
            whereClause += 'project_title = $1';
            queryParams.push(project_title);
        }
        if (project_type !== undefined) {
            if (whereClause !== '') {
                whereClause += ' AND ';
            }
            whereClause += 'project_type = $' + (queryParams.length + 1);
            queryParams.push(project_type);
        }

        // Add WHERE clause and LIMIT/OFFSET to the query if necessary
        if (whereClause !== '') {
            query += ' WHERE ' + whereClause;
        }
        query += ' LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
        queryParams.push(perpage, offset);
        client.query(query, queryParams, (err, result) => {
            if (err) {
                if (err.detail) {
                    console.log(err);
                    res.json({
                        error: "failed_to_load_response",
                    });
                }
            } else {
                let _finalTotalCount;
                let _queryParams = Object.keys(req.query)
                _queryParams.filter((item) => {
                    if (!isFilteredData.includes(item)) {
                        _finalTotalCount = totalCount;
                    } else {
                        _finalTotalCount = result.rowCount;
                    }
                });
                {
                    res.status(200).json({
                        statusCode: 200,
                        message: "project_list",
                        offset: offset,
                        perpage: perpage,
                        total: Number(_finalTotalCount),
                        data: result.rows,
                    });
                }

            }
        });
    } catch (error) {
        console.log(error);
    }

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

updateProjectDetails = (request, response, next) => {
    const _newProjectParams = Joi.object({
        prject_id: Joi.number().required(),
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
        prject_id = request.body.prject_id;
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
            `UPDATE _tblProjects
            SET            
            project_title = $1,
            project_type = $2,
            project_status = $3,
            project_client = $4,
            project_assigned_manager = $5,
            project_assigned_developers = $6,
            sprint_planned = $7,
            project_cost = $8,
            currency = $9,
            project_start_date = $10,
            project_completion_date = $11,
            created_at = $12,
            updated_at = $13
            WHERE prject_id = $14 `;
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
            updated_at,
            prject_id
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
                        "project-details_updated_successfully",
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
    updateProjectDetails,
    deleteProjectById
}
