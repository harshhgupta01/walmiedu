var params = new URLSearchParams(location.search);
lectureId = params.get('lecture_id');

//get request for setting header data for class
function loadHeader()
{
    fetch(apiUrl+'/student/viewLecture/'+lectureId ,{
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
    //header_classteacher_email
    document.getElementById("header_lecture").innerText = data.result2.lecture_topic;
    document.getElementById("vimeo_video").src = data.result2.lecture_path; 
}
loadHeader();

function markVideoAsWatched()
{
    fetch(apiUrl+'/student/createView/'+lectureId,
    {
        mode: 'cors',
        method: 'POST',
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
        
    }) 
    return false;
}
markVideoAsWatched();

