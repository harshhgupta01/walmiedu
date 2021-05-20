
function displayEditContainer(id, ele)
{
    document.getElementById(id).style.display="flex";
    document.getElementById("form_student_name").value = ele.dataset.name;
    document.getElementById("form_student_email").value = ele.dataset.email;
    document.getElementById("form_student_mobile").value = ele.dataset.phone;
    document.getElementById("form_student_id").value = ele.dataset.id;
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}

//get request for setting header data for class
function loadHeader()
{
    fetch(apiUrl+'/teacher/yourClass' ,{
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
    if(data.result)
    {
        document.getElementById("header_class_name").innerText = data.result.class_name;

        if(data.strength)
            document.getElementById("header_total_student").innerText = data.strength;
        else
            document.getElementById("header_total_student").innerText = "0";

        var lecture = document.getElementById("lecture-list");
        if(data.error)
        {
            lecture.innerHTML="<h4 style='color:red;'>No students in your class!</h4>";
        }
        else
        {
            for(i=0;i<data.students.length;i++)
            {
                lecture.innerHTML += `
                    <div class="card">
                        <p>${data.students[i].student_name}</p>
                        <p>${data.students[i].student_email}</p>
                        <p>${data.students[i].student_phone}</p>
                        <br><br>
                        <p class="view-details-button" onclick="deleteStudent('${data.students[i].student_id}')">Delete</p>
                        <p class="edit-details-button" data-id="${data.students[i].student_id}" data-name="${data.students[i].student_name}" data-email="${data.students[i].student_email}" data-phone="${data.students[i].student_phone}" onclick="displayEditContainer('edit-student',this)">Edit</p>
                    </div>
                `;
            }
        }
    }
    else
    {
        document.getElementById("main-div").innerHTML=`<h4 style='color:red;text-align:center'>${data.error}</h4>`;
    }
}
loadHeader();


function updateStudent()
{
    
    var submitButton = document.getElementById("form-updatestudent-submit"); 
    submitButton.disabled = true;
    
    var student_id = document.getElementById("form_student_id").value;
    var student_name = document.getElementById("form_student_name").value;
    var student_mobile = document.getElementById("form_student_mobile").value;
    var student_email = document.getElementById("form_student_email").value;
    //post
    data = 
    {
        "student_id": student_id,
        "student_name": student_name,
        "student_phone": student_mobile,
        "student_email": student_email
    }
    fetch(apiUrl+'/teacher/updateStudent',
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
            Notiflix.Report.Success('Success','Student details updated','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error updating the student details. '+e.error,'OK');
            submitButton.disabled = false;
        }
    }) 
    return false;
}


function deleteStudent(studentId)
{
    Notiflix.Confirm.Show( 'Need Confirmation', 'Are you sure you want to remove this student?', 'Yes', 'No',
    function()
    {
         data = 
        {
            "student_id": studentId
        }
        fetch(apiUrl+'/teacher/deleteStudent',
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
                Notiflix.Report.Success('Success','Student Deleted','OK',function(){location.reload();});
            }
            else if(e.error)
            {
                Notiflix.Report.Failure('ERROR','Error deleting student details','OK',function(){location.reload();});
            }
        }) 
    },
    function()
    {

    });
}