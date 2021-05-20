var params = new URLSearchParams(location.search);
classId = params.get('class_id');

document.getElementById("back_button").setAttribute("href","class-detail.html?class_id="+classId);

function displayEditContainer(id, ele)
{
    document.getElementById(id).style.display="flex";
    document.getElementById("form_subject_id").value = ele.dataset.subjectid;
    document.getElementById("form_subject_name").value = ele.dataset.subjectname;
    document.getElementById("form_subject_teacher_id").value = ele.dataset.teacherid;
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}

function addSubject()
{
    
    var submitButton = document.getElementById("addsubject-submit"); 
    submitButton.disabled = true;
    
    var subject_name = document.getElementById("subject_name").value;
    var teacher_id = document.getElementById("teacher_id").value;
    //post
    data = 
    {
        "class_id": classId,
        "subject_name": subject_name,
        "teacher_id": teacher_id
    }
    fetch(apiUrl+'/head/addSubject',
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
            Notiflix.Report.Success('Success','Subject added','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error adding the Subject','OK',function(){location.reload();});
        }
    }) 
    return false;
}


function loadTeachersForDropdown()
{
    fetch(apiUrl+'/head/viewTeachers',{
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
                setSchoolDataForDropdown(data);
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setSchoolDataForDropdown(data)
{
    var teacher = document.getElementById("teacher_id");
    var formteacher = document.getElementById("form_subject_teacher_id");
    for(i=0;i<data.length;i++)
    {
        teacher.innerHTML += `<option value="${data[i].teacher_id}">${data[i].teacher_name}</option>`;
        formteacher.innerHTML += `<option value="${data[i].teacher_id}">${data[i].teacher_name}</option>`;
    }
}
loadTeachersForDropdown();




//get request for subject inside class
function loadSubject()
{
    fetch(apiUrl+'/head/viewClassSubjects/'+classId ,{
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
                Notiflix.Block.Remove("#subject-list");
                console.log(data);
                if(data.length)
                {
                    setSubjectData(data);
                }
                else
                {
                    var school = document.getElementById("subject-list");
                    school.innerHTML="<h4 style='color:red'>No Subject found!</h4>"
                }
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setSubjectData(data)
{
    var school = document.getElementById("subject-list");
    for(i=0;i<data.length;i++)
    {
        school.innerHTML += `
            <div class="card">
                <p>${data[i].subject_name}</p>
                <p>${data[i].teacher.teacher_name}</p>
                <p>${data[i].teacher.teacher_email}</p>
                <br><br>
                <p class="delete-teacher-button" onclick="deleteStudent(${data[i].id})">Delete</p>
            </div>`;
        /*school.innerHTML += `
            <div class="card">
                <p>${data[i].subject_name}</p>
                <p>${data[i].teacher.teacher_name}</p>
                <p>${data[i].teacher.teacher_email}</p>
                <br><br>
                <p class="edit-details-button" data-subjectid="${data[i].id}" data-subjectname="${data[i].subject_name}" data-teacherid="${data[i].teacher_id}"  onclick="displayEditContainer('edit-subject',this)">Edit</p>
                <p class="delete-teacher-button" onclick="deleteStudent(${data[i].id})">Delete</p>
            </div>`;*/
    }
}
loadSubject();

function updateClassDetails()
{
    
    var submitButton = document.getElementById("form-updatesubject-submit"); 
    submitButton.disabled = true;
    
    var subject_id = document.getElementById("form_subject_id").value;
    var subject_name = document.getElementById("form_subject_name").value;
    var teacher_id = document.getElementById("form_subject_teacher_id").value;
    //post
    data = 
    {
        "subject_id": subject_id,
        "subject_name": subject_name,
        "teacher_id": teacher_id
    }
    fetch(apiUrl+'/head/updateSubject',
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
            Notiflix.Report.Success('Success','Subject details updated','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error upadting subject details '+e.error,'OK',function(){location.reload();});
        }
    }) 
    return false;
}

function deleteStudent(subjectId)
{
    Notiflix.Confirm.Show( 'Need Confirmation', 'Are you sure you want to remove this subject?', 'Yes', 'No',
    function()
    {
         data = 
        {
            "subject_id": subjectId
        }
        fetch(apiUrl+'/head/deleteSubject',
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
                Notiflix.Report.Success('Success','Subject Deleted','OK',function(){location.reload();});
            }
            else if(e.error)
            {
                Notiflix.Report.Failure('ERROR',e.error,'OK',function(){location.reload();});
            }
        }) 
    },
    function()
    {

    });
}

