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
                if(!data.length)
                {
                    var school = document.getElementById("class-list");
                    school.innerHTML="<h4 style='color:red'>No classes found!</h4>";
                }
                else
                    setClassesData(data);
                
            });
        }
        else
        {
            var school = document.getElementById("class-list");
            school.innerHTML="<h4 style='color:red'>No classes found!</h4>";
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
                <div class="card-header">
                    <h2>${data[i].class_name}</h2>
                    <p>${data[i].teacher.teacher_name}</p>
                </div>
                <div>
                    <br><br>
                    <a  href="class-detail.html?class_id=${data[i].class_id}" class="main-button">View Details</a>
                </div>
            </div>`;
    }
}
loadClasses();
