var params = new URLSearchParams(location.search);
subjectId = params.get('subject_id');
assignmentId = params.get('assignment_id');

document.getElementById("back-button").setAttribute("href", "manage-assignment.html?subject_id="+subjectId);

//get request for setting header data for class
function loadHeader()
{
    fetch(apiUrl+'/teacher/viewResponse/'+assignmentId ,{
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
    document.getElementById("header_assignment_name").innerText = data.assignment.title;
    
        
    var lecture = document.getElementById("lecture-list");
    if(!data.result)
    {
        lecture.innerHTML="<h4 style='color:red'>No response found!</h4>";
    }
    else
    {
        for(i=0;i<data.result.length;i++)
        {
            lecture.innerHTML += `
                <div class="card">
                    <p>${data.result[i].student.student_name}</p>
                    <p>${data.result[i].student.student_email}</p>
                    <a class="main-button" href="${apiUrl}/teacher/downloadResponse/${data.result[i].response_id}" target="_blank" download>Download</a>
                    <br><br>
                </div>
            `;
        }
    }
}
loadHeader();
