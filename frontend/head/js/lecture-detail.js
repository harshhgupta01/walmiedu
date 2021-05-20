var params = new URLSearchParams(location.search);
classId = params.get('class_id');
teacherId = params.get('teacher_id');
subjectId = params.get('subject_id');

document.getElementById("back_button").setAttribute("href","class-detail.html?class_id="+classId);

function displayEditContainer(id)
{
    if(id=='edit-lecture')
    {
        alert("lecture");
    }
    else if(id=='edit-subjectteacher')
    {
        alert("subjectteacher");
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
    fetch(apiUrl+'/head/viewSubject/'+classId+'/'+teacherId+'/'+subjectId ,{
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
    document.getElementById("header_subject_name").innerText = data.subject_name;
    document.getElementById("header_subjectteacher_name").innerText = data.teacher.teacher_name;
    document.getElementById("header_subjectteacher_email").innerText = data.teacher.teacher_email;
}
loadHeader();


function loadDeliveredLectures()
{
    fetch(apiUrl+'/head/viewTeacherLectures/'+subjectId ,{
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
                if(data.length)
                {
                    setDeliveredLectures(data);
                }
                else
                {
                    var school = document.getElementById("lecture-list");
                    school.innerHTML="<h4 style='color:red'>No Lecture found!</h4>"
                }
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setDeliveredLectures(data)
{
    var school = document.getElementById("lecture-list");
    for(i=0;i<data.length;i++)
    {
        school.innerHTML += `
            <div class="card">
                <p>${data[i].lecture_topic}</p>
                <p>${data[i].lecture_description}</p>
                <br>
                <a class="main-button" target="_blank" href="watchlecture.html?lecture_id=${data[i].id}">Watch</a>
                <br><br>
            </div>`;
    }
}
loadDeliveredLectures();
