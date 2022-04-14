asyncFunction = async () => {

    //Fires the GET API defined in the function on page load
	// All URLs to the Advanced I/O function will be of the pattern: /server/{function_name}/{url_path}
    let getTodo = await fetch("/server/to_do_list_function/todo");//Ensure that 'to_do_list_function' is the package name of your function
    let dataList = await getTodo.json();
    let pendingHtml = [];
    let completedHtml = [];
    dataList.forEach(element => {
        if (element.Status == "Pending") {
            pendingHtml.push('<li id="' + element.ROWID + '">' + element.Task + ' <button id="complete" onclick="taskComplete('+element.ROWID+')">Complete</button> <button id="delete" onclick="taskDelete('+element.ROWID+')">Delete</button></li>');
        }
        else{
            completedHtml.push('<li id="' + element.ROWID + '">' + element.Task + ' <button id="delete" onclick="taskDelete('+element.ROWID+')">Delete</button></li>');
        }
       });
    if (pendingHtml.length) {
    $("#ulListPending").append(pendingHtml);//Appends the items to the HTML from the server on success
    }
    if (completedHtml.length) {
    $("#ulListCompleted").append(completedHtml);//Appends the items to the HTML from the server on success
    }
    //Fires the POST API defined in the function
	// All URLs to the Advanced I/O function will be of the pattern: /server/{function_name}/{url_path}
    var onSubmit = async () => {
        let taskValue= $("#task").val();
        let data = {Task:taskValue,Status:"Pending"};
        let url = "/server/to_do_list_function/todo";
        let options = {
            method:"POST",
            headers:{
                "Content-Type":"application/json; charset=utf-8"
            },
            body:JSON.stringify(data)
        }
        let postTodo = await fetch(url,options); //Ensure that 'to_do_list_function' is the package name of your function
        let rowData = await postTodo.json();
        if (rowData.ROWID != null) {
            let htmlData = '<li id="' + rowData.ROWID + '">' + rowData.Task + ' <button id="complete" onclick="taskComplete('+rowData.ROWID+')">Complete</button> <button id="delete" onclick="taskDelete('+rowData.ROWID+')">Delete</button></li>';
            $("#ulListPending").append(htmlData);
            $("#task").val(null);
        }
        else{
            console.log(rowData);
        }
    }
    $('#taskForm').on('submit', ()=>{
        onSubmit();
        return false;
    });

    //Fires the DELETE API on the delete button's click
	// All URLs to the Advanced I/O function will be of the pattern: /server/{function_name}/{url_path}
    taskDelete = async recID => {
        let delTodo = await fetch("/server/to_do_list_function/todo/"+recID,{method:"DELETE"});
        let taskID = await delTodo.text();
        $('#'+taskID).remove();
    }
    taskComplete = async recID => {
        let data = {
            Status:"Completed",
            ROWID:recID
        }
        let options = {
            method:"PATCH",
            headers:{
                "Content-Type":"application/json; charset=utf-8"
            },
            body:JSON.stringify(data)
        }
        let updateToDO = await fetch("/server/to_do_list_function/todo",options);
        let returnData = await updateToDO.json();
        console.log(returnData);
        let rowHtml = $('#'+returnData.ROWID);
        console.log(rowHtml);
        rowHtml.children()[0].remove();
        $("#ulListCompleted").append(rowHtml);
    }
}
asyncFunction();