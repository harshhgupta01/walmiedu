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
function loadNotes()
{
    Notiflix.Block.Standard('#notes-list','Loading...');
    
    subjectId = document.getElementById("subject_id").value;
    fetch(apiUrl+'/student/viewNotes/'+subjectId ,{
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
        if(i==0)
        {
            lecture.innerHTML = `
                <div class="card">
                    <p>${data[i].title}</p>
                    <a href="${apiUrl}/student/downloadNote/${data[i].note_id}" download>Download Notes</a>
                    <br><br>
                </div>
            `;
        }
        else
        {
            lecture.innerHTML += `
                <div class="card">
                    <p>${data[i].title}</p>
                    <a href="${apiUrl}/student/downloadNote/${data[i].note_id}" download>Download Notes</a>
                    <br><br>
                </div>
            `;
        }
    }
}
