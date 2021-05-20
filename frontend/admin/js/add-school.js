function displayEditContainer(id)
{
    document.getElementById(id).style.display="flex";
}
function hideEditContainer(id)
{
    document.getElementById(id).style.display="none";
}
function addSchool()
{
    
    var submitButton = document.getElementById("addschool-submit"); 
    submitButton.disabled = true;
    var school_name = document.getElementById("school_name").value;
    var school_address = document.getElementById("school_address").value;
    var head_name = document.getElementById("head_name").value;
    var head_email = document.getElementById("head_email").value;
    var head_password = document.getElementById("head_password").value;
    //post
    data = 
    {
        "school_name": school_name,
        "school_address": school_address,
        "head": head_name,
        "head_email": head_email,
        "head_password": head_password
    }
    fetch(apiUrl+'/admin/addSchool',
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
            Notiflix.Report.Success('Success','School added','OK',function(){location.reload();});
        }
        else if(e.error)
        {
            Notiflix.Report.Failure('ERROR','Error adding the school','OK',function(){location.reload();});
            submitButton.disabled = false;
        }
    }) 
    return false;
}