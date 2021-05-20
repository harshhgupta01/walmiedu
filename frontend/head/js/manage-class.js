function displayEditContainer(id, ele)
{
    document.getElementById(id).style.display="flex";
    document.getElementById("form_class_id").value = ele.dataset.classid;
    document.getElementById("form_class_name").value = ele.dataset.classname;
    document.getElementById("form_class_teacher_id").value = ele.dataset.teacherid;
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}


function addClass()
{
    
    var submitButton = document.getElementById("addclass-submit"); 
    submitButton.disabled = true;
    var class_name = document.getElementById("class_name").value;
    var class_teacher_id = document.getElementById("class_teacher_id").value;
    //post
    data = 
    {
        "class_name": class_name,
        "class_teacher_id": class_teacher_id
    }
    fetch(apiUrl+'/head/createClass',
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
            Notiflix.Report.Success('Success','Class added','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error adding class','OK',function(){location.reload();});
            submitButton.disabled = false;
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
    var teacher = document.getElementById("class_teacher_id");
    var formteacher = document.getElementById("form_class_teacher_id");
    for(i=0;i<data.length;i++)
    {
        teacher.innerHTML += `<option value="${data[i].teacher_id}">${data[i].teacher_name}</option>`;
        formteacher.innerHTML += `<option value="${data[i].teacher_id}">${data[i].teacher_name}</option>`;
    }
}
loadTeachersForDropdown();




function loadClasses()
{
    fetch(apiUrl+'/head/viewClasses',{
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
                Notiflix.Block.Remove("#class-list");
                console.log(data);
                if(data.length)
                {
                    setClassesData(data);
                }
                else
                {
                    var school = document.getElementById("class-list");
                    school.innerHTML="<h4 style='color:red'>No Class found!</h4>"
                }
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setClassesData(data)
{
    var school = document.getElementById("class-list");
    for(i=0;i<data.length;i++)
    {
        school.innerHTML += `
            <div class="card">
                <p class="class-name">${data[i].class_name}</p>
                <p>${data[i].teacher.teacher_name}</p>
                <br><br>
                <p class="edit-details-button" data-classid="${data[i].class_id}" data-classname="${data[i].class_name}" data-teacherid="${data[i].teacher.teacher_id}"  onclick="displayEditContainer('edit-teacher',this)">Edit</p>
                <p class="delete-teacher-button" onclick="deleteClass(${data[i].class_id})">Delete</p>
            </div>`;
    }
}
loadClasses();



function updateClassDetails()
{
    
    var submitButton = document.getElementById("form-updateclass-submit"); 
    submitButton.disabled = true;
    
    var class_id = document.getElementById("form_class_id").value;
    var class_name = document.getElementById("form_class_name").value;
    var class_teacher_id = document.getElementById("form_class_teacher_id").value;
    //post
    data = 
    {
        "class_id": class_id,
        "class_name": class_name,
        "class_teacher_id": class_teacher_id
    }
    fetch(apiUrl+'/head/updateClass',
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
            Notiflix.Report.Success('Success','Class details updated','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR',e.error,'OK',function(){location.reload();});
            submitButton.disabled = false;
        }
    }) 
    return false;
}


function deleteClass(classID)
{
    Notiflix.Confirm.Show( 'Need Confirmation', 'Are you sure you want to remove this class?', 'Yes', 'No',
    function()
    {
         data = 
        {
            "class_id": classID
        }
        fetch(apiUrl+'/head/deleteClass',
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
                Notiflix.Report.Success('Success','Class Deleted','OK',function(){location.reload();});
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
