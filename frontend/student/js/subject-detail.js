var params = new URLSearchParams(location.search);
subjectId = params.get('subject_id');

//get request for setting header data for class
function loadHeader()
{
    fetch(apiUrl+'/student/viewSubject/'+subjectId ,{
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
    //header_classteacher_email
    document.getElementById("header_subject_name").innerText = data.subject.subject_name;
    
    if(data.count)
        document.getElementById("header_total_lecture").innerText = data.count;
    else
        document.getElementById("header_total_lecture").innerText = "0";
    
    var lecture = document.getElementById("lecture-list");
    if(data.error)
    {
        lecture.innerHTML="<h4 style='color:red'>No lecture found!</h4>";
    }
    else
    {
        for(i=0;i<data.lectures.length;i++)
        {
            lecture.innerHTML += `
                <div class="card">
                    <p>${data.lectures[i].lecture_topic}</p>
                    <p>${data.lectures[i].lecture_description}</p>
                    <a class="main-button" href="watchlecture.html?lecture_id=${data.lectures[i].id}">Watch</a>
                    <br><br>
                </div>
            `;
        }
    }
}
loadHeader();

