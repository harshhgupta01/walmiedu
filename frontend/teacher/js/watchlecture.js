var params = new URLSearchParams(location.search);
lectureId = params.get('lecture_id');

//get request for setting header data for class
function loadHeader()
{
    fetch(apiUrl+'/teacher/viewLecture/'+lectureId ,{
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
                Notiflix.Block.Remove("#watch-list");
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
    document.getElementById("header_lecture").innerText = data.result.lecture_topic;
    document.getElementById("vimeo_video").src = data.result.lecture_path;
    
    
    var lecture = document.getElementById("watch-list");
    if(!data.result2.length)
    {
        lecture.innerHTML="<h4 style='color:red'>No students have watched the lecture yet!</h4>";
    }
    else
    {
        for(i=0;i<data.result2.length;i++)
        {
            lecture.innerHTML += `
                <div class="card">
                    <p>${data.result2[i].student.student_name}</p>
                    <p>${data.result2[i].student.student_email}</p>
                </div>
            `;
        }
    }
}
loadHeader();

