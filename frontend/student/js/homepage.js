function loadSubjects()
{
    fetch(apiUrl+'/student/viewSubjects',{
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
                if(data)
                {
                    setSubjectsData(data);
                }
                else
                {
                    //need to redirect
                    console.log("error");
                }
                
            });
        }
        else
        {
            var school = document.getElementById("subject-list");
            school.innerHTML="<h4 style='color:red'>No subject found!</h4>";
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setSubjectsData(data)
{
    //header_classteacher_email
    document.getElementById("header_student_name").innerText = data.student_name;
    
    document.getElementById("header_class_name").innerText = data.class_name;
    
    var lecture = document.getElementById("subject-list");
    if(!data.subjects.length)
    {
        lecture.innerHTML="<h4 style='color:red'>No subjects are added to this class!</h4>";
    }
    else
    {
        for(i=0;i<data.subjects.length;i++)
        {
            lecture.innerHTML += `
            <div class="card">
                <div class="card-header">
                    <h2>${data.subjects[i].subject_name}</h2>
                </div>
                <div>
                    <p>${data.subjects[i].teacher.teacher_name}</p>
                    <br>
                    <a  href="subject-detail.html?subject_id=${data.subjects[i].id}" class="main-button">View Details</a>
                </div>
            </div>`;
        }
    }
}
loadSubjects();
        