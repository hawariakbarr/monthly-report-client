"use strict";

var urlData = ''
fetch("../env.json")
  .then(response => response.json())
  .then(json => urlData = json[0].local_url);

const userForm = document.getElementById("loginFormData");
userForm.addEventListener("submit", function(e){  
  e.preventDefault();
  
  var userEmail = document.getElementById('userEmail').value
  var userPassword = document.getElementById('userPassword').value

  // //Obj of data to send in future like a dummyDb
  const data = { 
    email: userEmail,
    password: userPassword
  };  
  
  let date = new Date();
  date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();

  $.ajax({
    url: `${urlData}user/login`,
    type: 'POST',
    data: JSON.stringify(data),
    datatype: 'json',
    contentType: 'application/json',
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
    },
    success: function (result) {
        // element is div holding the ParticalView
        if(result.error)
        {
          iziToast.error({
            title: 'Login Gagal',
            message: `${result.message}`,
            position: 'topRight'
          }) 
          setTimeout(() => {
            location.reload()
          }, 3000)           
        }
        else{
          document.cookie = `session=Bearer ${result.data.token}; ${expires}`
          document.cookie = `user name= ${result.data.name}`
          document.cookie = `role= ${result.data.role}`
        }
          
    },
    complete: function (responseJSON) {
      document.getElementById("overlay").setAttribute("hidden", false);
      if(document.cookie.length > 0 )
      {
        window.location.href  = 'index.html'
        return true;
      }
    },
    error: function (xhr, status, p3, p4) {
    }
  }).fail(function (responseJSON, result, data) {
      // ignore the error and do nothing else
      iziToast.error({
        title: 'Login Gagal',
        message: `${responseJSON.responseJSON.message}`,
        position: 'topRight'
      })            
  });
});