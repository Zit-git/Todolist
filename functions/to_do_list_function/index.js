var express = require('express');
var app = express();
app.use(express.json()); // This supports the JSON encoded bodies
var catalyst = require('zcatalyst-sdk-node');

//The GET API gets data from the TodoItems table in the Data Store
app.get('/todo/:userID', function (req, res) {
	var userID = req.params.userID;
	var catalystApp = catalyst.initialize(req);
	getToDoListFromDataStore(catalystApp,userID).then(notes => {
		let data = notes.map(element => {
			return {
				ROWID:element.TodoItems.ROWID,
				Task:element.TodoItems.Task,
				Status:element.TodoItems.Status
			};
			});
			res.send(data); //Sends the HTML data back to the client for rendering
		}
	).catch(err => {
		console.log(err);
		sendErrorResponse(res);
	});
});

//The POST API sends data to persist in the TodoItems table in the Data Store
app.post('/todo', function (req, res) {
	console.log(req.body);
	var catalystApp = catalyst.initialize(req);
	var datastore = catalystApp.datastore();
	var table = datastore.table('TodoItems');
	var taskVal = req.body.Task;
	var statusVal = req.body.Status;
	var rowData = {
		Task:taskVal,
		Status:statusVal
	}
	console.log(rowData);
	var insertPromise = table.insertRow(rowData);
	insertPromise.then((row) => {
		res.send(row);
		// res.redirect(req.get('referer')); //Reloads the page again after a successful insert
	}).catch(err => {
		console.log(err);
		sendErrorResponse(res);
	});
});
app.patch('/todo',function (req,res){
	console.log(req.body);
	let catalystApp = catalyst.initialize(req);
	let datastore = catalystApp.datastore();
	let table = datastore.table('TodoItems');
	let idValue = req.body.ROWID;
	let statusVal = req.body.Status;
	let rowData = {
		ROWID:idValue,
		Status:statusVal
	}
	let rowPromise = table.updateRow(rowData);
    rowPromise.then((row) => {
		res.send(row);
        }).catch(err => {
			console.log(err);
			sendErrorResponse(res);
		});
})

//The DELETE API deletes the selected items from the Data Store
app.delete('/todo/:recID', function (req, res) {
	var id = req.params.recID;
	var catalystApp = catalyst.initialize(req);
	let datastore = catalystApp.datastore();
	let table = datastore.table('TodoItems');
	let rowPromise = table.deleteRow(id);
	rowPromise.then((row) => {
		res.send(id);
	}).catch(err => {
		console.log(err);
		sendErrorResponse(res);
	});
});

//This function executes the ZCQL query to retrieve items from the Data Store
function getToDoListFromDataStore(catalystApp,userID) {
	return new Promise((resolve, reject) => {
		// Queries the table in the Data Store
		catalystApp.zcql().executeZCQLQuery("Select * from TodoItems WHERE CREATORID="+userID+" order by createdtime").then(queryResponse => {
			resolve(queryResponse);
		}).catch(err => {
			reject(err);
		})
	});
}
function sendErrorResponse(res) {
	res.status(500);
	res.send({
		"error": "Internal server error occurred. Please try again in some time."
	});
}

module.exports = app;