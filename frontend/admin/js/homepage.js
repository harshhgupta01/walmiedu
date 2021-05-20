var active=0;
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
function loadSchools()
{
    fetch(apiUrl+'/admin/viewSchools',{
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
                Notiflix.Block.Remove("body");
                console.log(data);
                if(!data.length)
                {
                    var school = document.getElementById("school-list");
                    school.innerHTML="<h4 style='color:red'>No Schools found!</h4>";
                }
                else
                    setSchoolData(data);
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setSchoolData(data)
{
    var school = document.getElementById("school-list");
    for(i=0;i<data.length;i++)
    {
        school.innerHTML += `
            <div class="card">
                <div class="card-header">
                    <h2>${data[i].school_name}</h2>
                </div>
                <div>
                    <p>&nbsp;</p>
                    <a  href="school-detail.html?school_id=${data[i].school_id}" class="main-button">View Details</a>
                </div>
            </div>`;

    }
}
loadSchools();
