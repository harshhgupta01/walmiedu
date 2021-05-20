var params = new URLSearchParams(location.search);
schoolId = params.get('school_id');
classId = params.get('class_id');

document.getElementById("back-button").setAttribute("href","class-detail.html?class_id="+classId+"&school_id="+schoolId);

function displayEditContainer(id, ele)
{
    if(id=='edit-students')
    {
        alert("student");
    }
    else if(id=='edit-lecture')
    {
        document.getElementById("form_lecture_id").value = ele.dataset.lectureid;
        document.getElementById("form_lecture_topic").value = ele.dataset.lecturetopic;
        document.getElementById("form_lecture_description").value = ele.dataset.lecturedescription;
        document.getElementById("form_lecture_url").value = ele.dataset.lectureurl;
    }
    else if(id=='watch-lecture')
    {
        watchLectureUrl(ele.dataset.lectureurl);
    }
    document.getElementById(id).style.display="flex";
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
    if(id=='watch-lecture')
    {
        var player=document.getElementById("youtube");
        player.src="";
    }
}

function watchLectureUrl(url)
{
    var player=document.getElementById("youtube");
    player.src=url;
}


function loadSubjectForDropdown()
{
    fetch(apiUrl+'/admin/viewClassSubjects/'+classId,{
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
                setSubjectDataForDropdown(data);
                
            });
        }
    }).catch(error=> 
    {
        Notiflix.Report.Failure('ERROR','We could not connect to internet.','OK');
    });
}

function setSubjectDataForDropdown(data)
{
    var subject = document.getElementById("subject_id");
    //var formteacher = document.getElementById("form_subject_teacher_id");
    for(i=0;i<data.length;i++)
    {
        subject.innerHTML += `<option value="${data[i].id}">${data[i].subject_name}</option>`;
        //formteacher.innerHTML += `<option value="${data[i].teacher_id}">${data[i].teacher_name}</option>`;
    }
}
loadSubjectForDropdown();


//get request for subject inside class
function loadLecture(ele)
{
    Notiflix.Block.Standard('#lecture-list','Loading...');
    fetch(apiUrl+'/admin/viewLectures/'+ele.value ,{
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
                    setSubjectData(data);
                }
                else
                {
                    var school = document.getElementById("lecture-list");
                    school.innerHTML="<h4 style='color:red'>No Lecture found!</h4>";
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
    var school = document.getElementById("lecture-list");
    for(i=0;i<data.length;i++)
    {
        if(i==0)
        {
            school.innerHTML = `
            <div class="card">
                <p>${data[i].lecture_topic}</p>
                <p>${data[i].lecture_description}</p>
                <button class="main-button" data-lectureurl="${data[i].lecture_path}" onclick="displayEditContainer('watch-lecture', this)">Watch Lecture</button>
                <br><br><br><br>
                <p class="edit-details-button" data-lectureid="${data[i].id}" data-lecturetopic="${data[i].lecture_topic}" data-lecturedescription="${data[i].lecture_description}" data-lectureurl="${data[i].lecture_path}" onclick="displayEditContainer('edit-lecture', this)">Edit</p>
                <p class="delete-details-button" onclick="deleteLecture('${data[i].id}')">Delete</p>
            </div>`;
        }
        else
        {
            school.innerHTML += `
            <div class="card">
                <p>${data[i].lecture_topic}</p>
                <p>${data[i].lecture_description}</p>
                <button class="main-button" data-lectureurl="${data[i].lecture_path}" onclick="displayEditContainer('watch-lecture', this)">Watch Lecture</button>
                <br><br><br><br>
                <p class="edit-details-button" data-lectureid="${data[i].id}" data-lecturetopic="${data[i].lecture_topic}" data-lecturedescription="${data[i].lecture_description}" data-lectureurl="${data[i].lecture_path}" onclick="displayEditContainer('edit-lecture', this)">Edit</p>
                <p class="delete-details-button" onclick="deleteLecture('${data[i].id}')">Delete</p>
            </div>`;
       }
    }
}

function updateLecture()
{
    
    var submitButton = document.getElementById("from-updatelecture-submit"); 
    submitButton.disabled = true;
    
    var lecture_id = document.getElementById("form_lecture_id").value;
    var lecture_topic = document.getElementById("form_lecture_topic").value;
    var lecture_description = document.getElementById("form_lecture_description").value;
    var lecture_path = document.getElementById("form_lecture_url").value;
    //post
    data = 
    {
        "lecture_id": lecture_id,
        "lecture_topic": lecture_topic,
        "lecture_description": lecture_description,
        "lecture_path": lecture_path
    }
    fetch(apiUrl+'/admin/updateLecture',
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
        submitButton.disabled = false;
        if(e.message)
        {
            Notiflix.Report.Success('Success','Lecture details updated','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error upadting lecture details','OK',function(){location.reload();});
        }
    }) 
    return false;
}

function deleteLecture(lectureId)
{
    Notiflix.Confirm.Show( 'Need Confirmation', 'Are you sure you want to delete this Lecture?', 'Yes', 'No',
    function()
    {
        data = 
        {
            "lecture_id": lectureId
        }
        fetch(apiUrl+'/admin/deleteLecture',
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
                Notiflix.Report.Success('Success','Lecture Deleted','OK',function(){location.reload();});
            }
            else if(e.error)
            {
                Notiflix.Report.Failure('ERROR','Error deleting Lecture.','OK',function(){location.reload();});
            }
        })  
    },
    function()
    {

    });
}