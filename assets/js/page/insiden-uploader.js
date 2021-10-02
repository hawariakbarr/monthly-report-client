"use strict";

var urlData = ''
const getCookie = (cookie_name) =>{
    // Construct a RegExp object as to include the variable name
    const re = new RegExp(`(?<=${cookie_name}=)[^;]*`);
    try{
        return document.cookie.match(re)[0];	// Will raise TypeError if cookie is not found
    }catch{
        return "Who Are You?";
    }
}
window.onload = function() {
  if(document.cookie.length > 0 && getCookie("role") == "true")
  {
    fetch("../env.json")
        .then(response => response.json())
        .then(json => urlData = json[0].local_url)
        .then(function(){
        //   getData(urlData)
        });
  }
  else{
    // location.replace("errors-403.html")
    $('.section-body').empty()
    $('.header-label').text("Restricted Access")
    $('.section-body').html(` <div class="container mt-5">
    <div class="page-error">
      <div class="page-inner">
        <h1>403</h1>
        <div class="page-description">
            You do not have access to this page.
        </div>
        <div class="page-search">
          <div class="mt-3">
            <a href="index.html">Back to Home</a>
          </div>
        </div>
      </div>
    </div>
    <div class="simple-footer mt-5">
      Copyright &copy; Diskominfo Jabar 2021
    </div>
  </div>`)
  }
};

$("#table-1").dataTable({
  "columnDefs": [
    { "sortable": false, "targets": [] }
  ]
});

$("#table-2").dataTable({
  "columnDefs": [
    { "sortable": false, "targets": [] }
  ]
});