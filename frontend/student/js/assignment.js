function displayEditContainer(id, ele)
{
    document.getElementById(id).style.display="flex";
    document.getElementById("assignment_id").value = ele.dataset.assignment_id;
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}
function loadSubjectForDropdown()
{
    fetch(apiUrl+'/student/viewSubjectList',{
        method: 'GET',
        headers: 
        {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Authorization': "Bearer "+authToken
        },
    })
    .then(res =>{
        if(res.ok)
        {
            //console.log("Successfull");
            res.json().then(function(data)
            {
                console.log(data);
                setSubjectDataForDropdown(data);
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setSubjectDataForDropdown(data)
{
    var subject = document.getElementById("subject_id");
    for(i=0;i<data.length;i++)
    {
        subject.innerHTML += `<option value="${data[i].id}">${data[i].subject_name}</option>`;
    }
}
loadSubjectForDropdown();



//get request for setting notes for class
function loadAssignment()
{
    Notiflix.Block.Standard('#notes-list','Loading...');
    
    subjectId = document.getElementById("subject_id").value;
    fetch(apiUrl+'/student/viewAssignments/'+subjectId ,{
        method: 'GET',
        headers: 
        {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Authorization': "Bearer "+authToken
        },
    })
    .then(res =>{
        if(res.ok)
        {
            //console.log("Successfull");
            res.json().then(function(data)
            {
                Notiflix.Block.Remove("#notes-list");
                console.log(data);
                if(data.length)
                {
                    setAssignmentData(data);
                }
                else
                {
                    var lecture = document.getElementById("notes-list");
                    lecture.innerHTML="<h4 style='color:red'>No assignment issued!</h4>";
                }
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setAssignmentData(data)
{   
    var lecture = document.getElementById("notes-list");
    for(i=0;i<data.length;i++)
    {
        if(i==0)
        {
            lecture.innerHTML = `
                <div class="card">
                    <p>${data[i].title}</p>
                    <p>${data[i].submission_date}</p>
                    <p data-assignment_id="${data[i].assignment_id}" onclick="displayEditContainer('assignment-response', this)" class="edit-details-button">Submit</p>
                    <a class="view-details-button" href="${apiUrl}/student/downloadAssignment/${data[i].assignment_id}" download><p>Download</p></a>
                    <br><br>
                </div>
            `;
        }
        else
        {
             lecture.innerHTML += `
                <div class="card">
                    <p>${data[i].title}</p>
                    <p>${data[i].submission_date}</p>
                    <p data-assignment_id="${data[i].assignment_id}" onclick="displayEditContainer('assignment-response', this)" class="edit-details-button">Submit</p>
                    <a class="view-details-button" href="${apiUrl}/student/downloadAssignment/${data[i].assignment_id}" download><p>Download</p></a>
                    <br><br>
                </div>
            `;
        }
    }
}

function addAssignment()
{
    
    var submitButton = document.getElementById("addfile-submit"); 
    submitButton.disabled = true;
    
    fetch(apiUrl+'/student/submitResponse',
    {
        mode: 'cors',
        method: 'POST',
        body: new FormData(notes_form),
        headers: 
        {
            'Connection': 'keep-alive',
            'Authorization': "Bearer "+authToken
        },
    }).then((e) => 
    {
            return e.json()
    }).then((e) =>  
    {
        console.log(e);
        if(e.message)
        {
            Notiflix.Report.Success('Success','Response uploaded','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            submitButton.disabled = false;            
            Notiflix.Report.Failure('ERROR',e.error,'OK', function(){location.reload();});
        }
    }) 
    return false;
}

