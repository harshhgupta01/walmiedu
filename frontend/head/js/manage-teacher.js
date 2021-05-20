function displayEditContainer(id, ele)
{
    document.getElementById(id).style.display="flex";
    document.getElementById("form_teacher_name").value = ele.dataset.name;
    document.getElementById("form_teacher_email").value = ele.dataset.email;
    document.getElementById("form_teacher_mobile").value = ele.dataset.mobile;
    document.getElementById("form_teacher_id").value = ele.dataset.id;
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}

function addTeacher()
{
    
    var submitButton = document.getElementById("addteacher-submit"); 
    submitButton.disabled = true;
    
    var teacher_name = document.getElementById("teacher_name").value;
    var teacher_email = document.getElementById("teacher_email").value;
    var teacher_password = document.getElementById("teacher_password").value;
    var teacher_mobile = document.getElementById("teacher_mobile").value;
    
    //post
    data = 
    {
        "teacher_name": teacher_name,
        "teacher_email": teacher_email,
        "teacher_password": teacher_password,
        "teacher_mobile": teacher_mobile
    }
    fetch(apiUrl+'/head/addTeacher',
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
            Notiflix.Report.Success('Success','Teacher added','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error adding the teacher. '+e.error,'OK');
            submitButton.disabled = false;
        }
    }) 
    return false;
}


function loadTeachers()
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
                Notiflix.Block.Remove("#teacher-list");
                console.log(data);
                if(data.length)
                {
                    setSchoolData(data);
                }
                else
                {
                    var school = document.getElementById("teacher-list");
                    school.innerHTML="<h4 style='color:red'>No teacher found!</h4>"
                }
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setSchoolData(data)
{
    var school = document.getElementById("teacher-list");
    for(i=0;i<data.length;i++)
    {
        school.innerHTML += `
            <div class="card">
                <p>${data[i].teacher_name}</p>
                <p>${data[i].teacher_email}</p>
                <p>${data[i].teacher_phone}</p>
                <br><br>
                <p class="edit-details-button" data-name="${data[i].teacher_name}" data-id="${data[i].teacher_id}" data-email="${data[i].teacher_email}" data-mobile="${data[i].teacher_phone}" onclick="displayEditContainer('edit-teacher',this)">Edit</p>
                <p class="delete-teacher-button" onclick="deleteTeacher(${data[i].teacher_id})">Delete</p>
            </div>`;
    }
}
loadTeachers();


function updateTeacherDetails()
{
    
    var submitButton = document.getElementById("form-updateteacher-submit"); 
    submitButton.disabled = true;
    
    var teacher_id = document.getElementById("form_teacher_id").value;
    var teacher_name = document.getElementById("form_teacher_name").value;
    var teacher_email = document.getElementById("form_teacher_email").value;
    var teacher_mobile = document.getElementById("form_teacher_mobile").value;
    
    //post
    data = 
    {
        "teacher_id": teacher_id,
        "teacher_name": teacher_name,
        "teacher_email": teacher_email,
        "teacher_mobile": teacher_mobile
    }
    fetch(apiUrl+'/head/updateTeacher',
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
            Notiflix.Report.Success('Success','Teacher details updated','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error updating the teacher. '+e.error,'OK');
            submitButton.disabled = false;
        }
    }) 
    return false;
}


function deleteTeacher(teacherID)
{
    Notiflix.Confirm.Show( 'Need Confirmation', 'Are you sure you want to remove this teacher?', 'Yes', 'No',
    function()
    {
         data = 
        {
            "teacher_id": teacherID
        }
        fetch(apiUrl+'/head/deleteTeacher',
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
                Notiflix.Report.Success('Success','Teacher Deleted','OK',function(){location.reload();});
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