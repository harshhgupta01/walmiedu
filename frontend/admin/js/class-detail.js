var params = new URLSearchParams(location.search);
schoolId = params.get('school_id');
classId = params.get('class_id');

document.getElementById("editlecture-button").setAttribute("href","edit-lecture.html?class_id="+classId+"&school_id="+schoolId);
document.getElementById("addlecture-button").setAttribute("href","add-lecture.html?class_id="+classId+"&school_id="+schoolId);

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


//get request for setting header data for class
function loadHeader()
{
    fetch(apiUrl+'/admin/viewClass/'+classId ,{
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
                    setHeaderData(data);
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
    document.getElementById("header_class_name").innerText = data.class_name;
    document.getElementById("header_school_name").innerText = data.school.school_name;
}
loadHeader();



//get request for setting strength of class
function loadClassStrength()
{
    fetch(apiUrl+'/admin/classStudents/'+classId ,{
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
                    document.getElementById("header_class_strength").innerText = "0";
                }
                else
                {
                    document.getElementById("header_class_strength").innerText = data;
                }
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}
loadClassStrength();



//get request for subject inside class
function loadSubject()
{
    fetch(apiUrl+'/admin/viewClassSubjects/'+classId ,{
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
            </div>`;
    }
}
loadSubject();



//get request for students inside class
function loadStudent()
{
    fetch(apiUrl+'/admin/viewStudents/'+classId ,{
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
                Notiflix.Block.Remove("#student-list");
                console.log(data);
                if(data.length)
                {
                    setStudentData(data);
                }
                else
                {
                    var school = document.getElementById("student-list");
                    school.innerHTML="<h4 style='color:red'>No student found!</h4>"
                }
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setStudentData(data)
{
    var school = document.getElementById("student-list");
    for(i=0;i<data.length;i++)
    {
        school.innerHTML += `
            <div class="card">
                <p>${data[i].student_name}</p>
                <p>${data[i].student_email}</p>
                <p>${data[i].student_phone}</p>
            </div>`;
        /*school.innerHTML += `
            <div class="card">
                <p>${data[i].student_name}</p>
                <p>${data[i].student_email}</p>
                <p>${data[i].student_phone}</p>
                <p class="edit-details-button" onclick="displayEditContainer('edit-students')">Edit</p>
            </div>`;*/
    }
}
loadStudent();