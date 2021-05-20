var active=0;
function toggle()
{
    if(!active)
    {
        active=1;
        document.getElementsByClassName("list")[0].style.top="2px";
    }
    else
    {
        active=0;
        document.getElementsByClassName("list")[0].style.top="-450px";
    }
}
function logout()
{
    Notiflix.Confirm.Show( 'Need Confirmation', 'Are you sure you want to logout?', 'Yes', 'No',
    function()
    {
        fetch(apiUrl+'/student/logout',
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
            if(e.message)
            {
                deleteCookie("schoolStudent","",0);
                //window.open('login.html','_self');
				location.href = "login.html";
            }
            else if(e.error)
            {
                Notiflix.Report.Failure('ERROR','Error Logging out','OK');
            }
        })
    },
    function()
    {
         
    });
}
function deleteCookie(cname, cvalue, exdays) 
{
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}