var params = new URLSearchParams(location.search);
subjectId = params.get('subject_id');

document.getElementById("subject_id").value=subjectId;
document.getElementById("manage-assignment_button").setAttribute("href","manage-assignment.html?subject_id="+subjectId);

function displayEditContainer(id)
{
    
    document.getElementById(id).style.display="flex";
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}


//get request for setting header data for class
function loadHeader()
{
    fetch(apiUrl+'/teacher/viewSubject/'+subjectId ,{
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
                Notiflix.Block.Remove("#lecture-list");
                console.log(data);
                if(data)
                {
                    setHeaderData(data);
                }
                else
                {
                    //need to redirect
                    console.log("error");
                }
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setHeaderData(data)
{
    //header_classteacher_email
    document.getElementById("header_subject_name").innerText = data.subject.subject_name;
    
    if(data.count)
        document.getElementById("header_total_lecture").innerText = data.count;
    else
        document.getElementById("header_total_lecture").innerText = "0";
    
    var lecture = document.getElementById("lecture-list");
    if(data.error)
    {
        lecture.innerHTML="<h4 style='color:red'>No lecture found!</h4>";
    }
    else
    {
        for(i=0;i<data.lectures.length;i++)
        {
            lecture.innerHTML += `
                <div class="card">
                    <p>${data.lectures[i].lecture_topic}</p>
                    <p>${data.lectures[i].lecture_description}</p>
                    <br>
                    <a class="main-button" href="watchlecture.html?lecture_id=${data.lectures[i].id}">Watch</a>
                    <br><br><br>
                    <p class="edit-details-button" onclick="displayEditContainer('edit-lecture',this)">Edit</p>
                </div>
            `;
        }
    }
}
loadHeader();


//get request for setting notes for class
function loadNotes()
{
    fetch(apiUrl+'/teacher/viewNotes/'+subjectId ,{
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
                    setNotesData(data);
                }
                else
                {
                    var lecture = document.getElementById("notes-list");
                    lecture.innerHTML="<h4 style='color:red'>No notes added!</h4>";
                }
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setNotesData(data)
{   
    var lecture = document.getElementById("notes-list");
    for(i=0;i<data.length;i++)
    {
        lecture.innerHTML += `
            <div class="card">
                <p>${data[i].title}</p>
                <a href="${apiUrl}/teacher/downloadNote/${data[i].note_id}" download>Download Notes</a>
                <br><br><br>
                <p class="edit-details-button" onclick="deleteNotes('${data[i].note_id}')">Delete</p>
            </div>
        `;
    }
}
loadNotes();


function addNotes()
{
    
    var submitButton = document.getElementById("addfile-submit"); 
    submitButton.disabled = true;
    
    fetch(apiUrl+'/teacher/createNote',
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
            Notiflix.Report.Success('Success','Notes uploaded','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            submitButton.disabled = false;            
            Notiflix.Report.Failure('ERROR','Error adding Notes '+e.error,'OK');
        }
    }) 
    return false;
}

function deleteNotes(notesId)
{
    Notiflix.Confirm.Show( 'Need Confirmation', 'Are you sure you want to delete this notes?', 'Yes', 'No',
    function()
    {
         data = 
        {
            "note_id": notesId
        }
        fetch(apiUrl+'/teacher/deleteNote',
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
                Notiflix.Report.Success('Success','Notes Deleted','OK',function(){location.reload();});
            }
            else if(e.error)
            {
                Notiflix.Report.Failure('ERROR','Error deleting notes','OK',function(){location.reload();});
            }
        }) 
    },
    function()
    {

    });
}
