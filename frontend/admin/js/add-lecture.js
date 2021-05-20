var params = new URLSearchParams(location.search);
schoolId = params.get('school_id');
classId = params.get('class_id');

document.getElementById("back-button").setAttribute("href","class-detail.html?class_id="+classId+"&school_id="+schoolId);

function displayEditContainer(id)
{
    if(id=='edit-students')
    {
        alert("student");
    }
    else if(id=='edit-teachers')
    {
        alert("teachers");
    }
    document.getElementById(id).style.display="flex";
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}


function loadSubjectForDropdown()
{
    fetch(apiUrl+'/admin/viewClassSubjects/'+classId,{
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
    //var formteacher = document.getElementById("form_subject_teacher_id");
    for(i=0;i<data.length;i++)
    {
        subject.innerHTML += `<option value="${data[i].id}">${data[i].subject_name}</option>`;
        //formteacher.innerHTML += `<option value="${data[i].teacher_id}">${data[i].teacher_name}</option>`;
    }
}
loadSubjectForDropdown();


function addLecture()
{
    
    var submitButton = document.getElementById("addlecture-submit"); 
    submitButton.disabled = true;
    
    var subject_id = document.getElementById("subject_id").value;
    var lecture_topic = document.getElementById("lecture_topic").value;
    var lecture_url = document.getElementById("lecture_url").value;
    var lecture_description = document.getElementById("lecture_description").value;
    //post
    data = 
    {
        "subject_id": subject_id,
        "lecture_topic": lecture_topic,
        "lecture_path": lecture_url,
        "lecture_description": lecture_description
    }
    fetch(apiUrl+'/admin/addLecture',
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
            Notiflix.Report.Success('Success','Lecture added','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error adding the lecture','OK');
        }
    }) 
    return false;
}