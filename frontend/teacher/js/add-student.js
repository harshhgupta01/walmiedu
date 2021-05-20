function addStudent()
{
    
    var submitButton = document.getElementById("addstudent-submit"); 
    submitButton.disabled = true;
    
    var student_name = document.getElementById("student_name").value;
    var student_mobile = document.getElementById("student_mobile").value;
    var student_email = document.getElementById("student_email").value;
    var student_password = document.getElementById("student_password").value;
    //post
    data = 
    {
        "student_name": student_name,
        "student_phone": student_mobile,
        "student_email": student_email,
        "student_password": student_password
    }
    fetch(apiUrl+'/teacher/addStudents',
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
            Notiflix.Report.Success('Success','Student added','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            submitButton.disabled = false;
            Notiflix.Report.Failure('ERROR','Error adding the Student','OK',function(){location.reload();});
        }
    }) 
    return false;
}




