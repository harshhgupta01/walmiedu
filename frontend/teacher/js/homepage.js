function loadSubjects()
{
    fetch(apiUrl+'/teacher/viewTeacherSubjects',{
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
                if(!data.length)
                {
                    var school = document.getElementById("subject-list");
                    school.innerHTML="<h4 style='color:red'>No classes are alloted to you!</h4>";
                }
                else
                    setSubjectsData(data);
                
            });
        }
        else
        {
            var school = document.getElementById("subject-list");
            school.innerHTML="<h4 style='color:red'>No classes are alloted to you!</h4>";
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setSubjectsData(data)
{
    var school = document.getElementById("subject-list");
    for(i=0;i<data.length;i++)
    {
        school.innerHTML += `
            <div class="card">
                <div class="card-header">
                    <h2>${data[i].class.class_name}</h2>
                </div>
                <div>
                    <p>${data[i].subject_name}</p>
                    <br>
                    <a  href="subject-detail.html?subject_id=${data[i].id}" class="main-button">View Details</a>
                </div>
            </div>`;
    }
}
loadSubjects();
