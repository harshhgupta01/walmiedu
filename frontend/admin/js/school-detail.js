var params = new URLSearchParams(location.search);
schoolId = params.get('school_id');

function displayEditContainer(id)
{
    document.getElementById(id).style.display="flex";
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}

function loadStrength()
{
    fetch(apiUrl+'/admin/schoolStudents/'+schoolId,{
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
            res.json().then(function(data)
            {
                console.log(data);
                if(data.error)
                {
                    document.getElementById("header-school-strength").innerText = "0";
                }
                else
                {
                    document.getElementById("header-school-strength").innerText = data;
                }
                
            });
        }
        else
        {
            //window.open('index.html','_self');
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}
loadStrength();


function loadSchools()
{
    fetch(apiUrl+'/admin/viewSchools/'+schoolId,{
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
                if(data.error)
                {
                    window.open('index.html','_self');
                }
                else
                {
                    setSchoolData(data);
                }
                
            });
        }
        else
        {
            //window.open('index.html','_self');
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setSchoolData(data)
{
    document.getElementById('header-school-name').innerText = data.school_name;
    document.getElementById('head-name').innerText = data.head;
    document.getElementById('head-mail').innerText = data.head_email;
    
    
    //form data
    document.getElementById("form_school_name").value = data.school_name;
    document.getElementById("form_school_address").value = data.school_address;
    document.getElementById("form_head_name").value = data.head;
    document.getElementById("form_head_email").value = data.head_email;
}
loadSchools();



function loadClasses()
{
    fetch(apiUrl+'/admin/viewClasses/'+schoolId,{
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
                if(!data.length)
                {
                    var school = document.getElementById("class-list");
                    school.innerHTML="<h4 style='color:red'>No classes are added yet!</h4>";
                }
                else
                    setClassData(data);
                
            });
        }
        else
        {
            toastr.error("We could not connect to internet.");
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}
function setClassData(data)
{
    var classlist = document.getElementById("class-list");
    if(data.length==0)
    {
        classlist.innerHTML="<h4 style='color:red'>No class found!</h4>"
    }
    for(i=0;i<data.length;i++)
    {
        classlist.innerHTML += `
            <a href="class-detail.html?class_id=${data[i].class_id}&school_id=${schoolId}" class="card">
                <br>
                <h2>${data[i].class_name}</h2>
                <br>
            </a>`;
    }
}
loadClasses();




function updateSchoolDetails()
{
    var submitButton = document.getElementById("form-updateSchool-submit"); 
    submitButton.disabled = true;
    
    var school_name = document.getElementById("form_school_name").value;
    var school_address = document.getElementById("form_school_address").value;
    var head_name = document.getElementById("form_head_name").value;
    var head_email = document.getElementById("form_head_email").value;
    //post
    data = 
    {
        "school_id": schoolId,
        "school_name": school_name,
        "school_address": school_address,
        "head": head_name,
        "head_email": head_email
    }
    fetch(apiUrl+'/admin/updateSchool',
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
            Notiflix.Report.Success('Success','School details updated','OK', function(){ location.reload(); });
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error updating the school details','OK');
        }
        submitButton.disabled = false;
    }) 
    return false;
}