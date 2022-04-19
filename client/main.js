asyncFunction = async () => {
   let userData = await catalyst.auth.isUserAuthenticated().catch(err => {
        document.body.innerHTML = 'You are not logged in. Please log in to continue. Redirecting you to the login page..';
        setTimeout(function () {
            window.location.href = "new.html";
        }, 5000);
    });
    let userID = userData.content.user_id;
    console.log(userID);
    //Fires the GET API defined in the function on page load
	// All URLs to the Advanced I/O function will be of the pattern: /server/{function_name}/{url_path}
    let getTodo = await fetch("/server/to_do_list_function/todo/"+userID);//Ensure that 'to_do_list_function' is the package name of your function
    let dataList = await getTodo.json();
    console.log(dataList);
    let pendingHtml = [];
    let completedHtml = [];
    dataList.forEach(element => {
        if (element.Status == "Pending") {
            let pendingList = '<li class="list-group-item" id="' + element.ROWID + '"><input class="form-check-input me-1" type="checkbox" value="" aria-label="..." onclick="taskComplete('+element.ROWID+')">' + element.Task + ' <button class="btn btn-outline-danger" id="delete" onclick="taskDelete('+element.ROWID+')">X</button></li>';
            pendingHtml.push(pendingList);
        }
        else{
            let completeList = '<li class="list-group-item list-group-item-secondary" id="' + element.ROWID + '">' + element.Task + ' <button class="btn btn-outline-danger" id="delete" onclick="taskDelete('+element.ROWID+')">X</button></li>';
            completedHtml.push(completeList);
        }
       });
    if (pendingHtml){
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
            let htmlData = '<li class="list-group-item" id="' + rowData.ROWID + '"><input class="form-check-input me-1" type="checkbox" value="" aria-label="..." onclick="taskComplete('+rowData.ROWID+')">' + rowData.Task + ' <button class="btn btn-outline-danger" id="delete" onclick="taskDelete('+rowData.ROWID+')">X</button></li>';
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
 logout = () =>{

    //The signOut method is used to sign the user out of the application
    // var redirectURL = "https://" + document.domain + "/app/new.html";
    console.log(window.location.href)
    // debugger;
    var auth = catalyst.auth;
    auth.signOut(window.location.href);
}