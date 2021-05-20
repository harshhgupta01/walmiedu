var params = new URLSearchParams(location.search);
subjectId = params.get('subject_id');

document.getElementById("back-button").setAttribute("href","subject-detail.html?subject_id="+subjectId);
document.getElementById("subject_id").value=subjectId;

function displayEditContainer(id, ele)
{
    document.getElementById(id).style.display="flex";
    document.getElementById("form_title").value = ele.dataset.title;
    document.getElementById("form_submission_date").value = ele.dataset.date;
    document.getElementById("form_assignment_id").value = ele.dataset.id;
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}


//get request for setting notes for class
function loadAssignment()
{
    fetch(apiUrl+'/teacher/viewAssignments/'+subjectId ,{
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
                    lecture.innerHTML="<h4 style='color:red'>No Assignment added!</h4>";
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
        lecture.innerHTML += `
            <div class="card">
                <p>${data[i].title}</p>
                <p>${data[i].submission_date}</p>
                <a href="${apiUrl}/teacher/downloadAssignment/${data[i].assignment_id}" target="_blank" download>Download Assignment</a>
                <br><br>
                <a href="viewresponse.html?subject_id=${subjectId}&assignment_id=${data[i].assignment_id}" class="main-button">View Response</a>
                <br><br><br><br>
                <p class="delete-teacher-button" onclick="deleteAssignment('${data[i].assignment_id}')">Delete</p>
                <p class="edit-details-button" data-id="${data[i].assignment_id}" data-title="${data[i].title}" data-date="${data[i].submission_date}" onclick="displayEditContainer('edit-assignment',this)">Edit</p>
            </div>
        `;
    }
}
loadAssignment();


function addAssignment()
{
    
    var submitButton = document.getElementById("addfile-submit"); 
    submitButton.disabled = true;
    
    fetch(apiUrl+'/teacher/createAssignment',
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
            Notiflix.Report.Success('Success','Assignment uploaded','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            submitButton.disabled = false;            
            Notiflix.Report.Failure('ERROR','Error adding Assignment '+e.error,'OK');
        }
    }) 
    return false;
}

function deleteAssignment(assignmentId)
{
    Notiflix.Confirm.Show( 'Need Confirmation', 'Are you sure you want to delete this assignment?', 'Yes', 'No',
    function()
    {
         data = 
        {
            "assignment_id": assignmentId
        }
        fetch(apiUrl+'/teacher/deleteAssignment',
        {
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify(data),
            headers: 
            {
                'Content-Type': 'application/json',
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
                Notiflix.Report.Success('Success','Assignment Deleted','OK',function(){location.reload();});
            }
            else if(e.error)
            {
                Notiflix.Report.Failure('ERROR','Error deleting assignment','OK',function(){location.reload();});
            }
        }) 
    },
    function()
    {

    });
}


function updateAssignment()
{
    
    var submitButton = document.getElementById("form-updateclass-submit"); 
    submitButton.disabled = true;
    
    var assignment_id = document.getElementById("form_assignment_id").value;
    var title = document.getElementById("form_title").value;
    var submission_date = document.getElementById("form_submission_date").value;
    //post
    data = 
    {
        "assignment_id": assignment_id,
        "title": title,
        "submission_date": submission_date
    }
    console.log(data);
    fetch(apiUrl+'/teacher/updateAssignment',
    {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify(data),
        headers: 
        {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Authorization': "Bearer "+authToken
        },
    }).then((e) => 
    {
            return e.json()
    }).then((e) =>  
    {
        console.log(e);
        submitButton.disabled = false;
        if(e.message)
        {
            Notiflix.Report.Success('Success','Assignment details updated','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error updating Assignment '+e.error,'OK');
        }
    }) 
    return false;
}