"use strict";

var urlData = ''
$(function() {
  fetch("../env.json")
  .then(response => response.json())
  .then(json => urlData = json[0].local_url)
  .then(function(){
    getData(urlData)
  });
});

const getCookie = (cookie_name) =>{
  // Construct a RegExp object as to include the variable name
  const re = new RegExp(`(?<=${cookie_name}=)[^;]*`);
  try{
    return document.cookie.match(re)[0];	// Will raise TypeError if cookie is not found
  }catch{
    return "this-cookie-doesn't-exist";
  }
}

async function getData(urlData){
  
  await $.ajax({
    url: `${urlData}user/getAll`,
    type: 'GET',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
      document.getElementById("overlay").removeAttribute("hidden");
    },
    success: function (result) {
      var headTable = `
      <div class="table-responsive">
        <table class="table table-striped" id="table-1">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Role</th>
              <th>Active</th>
              <th>Nomer Telepon</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody id="nda-data">
      `;
      var tailTable = `
          </tbody>
        </table>
      </div>
      `;
      var listData = '';
      result.data.forEach((element, index) => {
        listData += `
          <tr>
            <td>${element.name}</td>
            <td>${element.role == true ? 'Super Admin' : 'Admin'}</td>
            <td>${element.active == true ? 
              'Yes' : 'No'}
            </td>
            <td>${element.phoneNumber}</td>
            <td>
              <button class="btn btn-info btn-sm btn-icon  mr-1" id="editBTn" data-toggle="tooltip" title="Edit" data-original-title="Edit" onClick="openEditModal(${element.id})"><i class="fas fa-pencil-alt fa-sm" style=" color:white"></i></button>
              <button class="btn btn-danger btn-sm btn-icon" data-toggle="tooltip" title="Delete" onClick="deleteUser(${element.id})"><i class="fas fa-trash fa-sm" style=" color:white"></i></button>
            </td>
          </tr>
        `
      }); 
      document.getElementById('user-here').innerHTML = headTable + listData + tailTable; 
    },
    complete: function () {
      $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })

      $("#table-1").dataTable({
        "columnDefs": [
          { "sortable": false, "targets": [] }
        ]
      });
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
        var err = "Error " + " " + status + " " + p3 + " " + p4;
        if (xhr.responseText && xhr.responseText[0] == "{")
          err = JSON.parse(xhr.responseText).Message;
          iziToast.error({
            title: `Get Data Unsuccessfully`,
            message: `${err}`,
            position: 'topRight'
          })
        return false;
    }
  });
}

const userForm = document.getElementById("userFormData");
userForm.addEventListener("submit", function(e){  
  e.preventDefault();
  var name = document.getElementById('userName').value
  var userEmail = document.getElementById('userEmail').value
  var userPassword = document.getElementById('userPassword').value
  var userRole =  document.getElementById('userRole').value
  var userPhone =  document.getElementById('userPhone').value
  
  //Obj of data to send in future like a dummyDb
  const data = { 
    name: name.toUpperCase(),
    email: userEmail,
    password: userPassword,
    role: userRole == "Admin" ? false : true,
    phoneNumber: userPhone.toString()
  };

  $.ajax({
    url: `${urlData}user/register`,
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
          document.getElementById("overlay").setAttribute("hidden", false);      
          iziToast.error({
            title: 'Gagal Menyimpan Data',
            message: `${result.message}`,
            position: 'topRight'
          })
        }
        else{
          document.getElementById("overlay").setAttribute("hidden", false);      
          $('#addUserModal').modal('hide');
          iziToast.success({
            title: 'User Berhasil Ditambahkan',
            message: `User Dengan Nama ${result.data.name} Berhasil Disimpan`,
            position: 'topRight'
          })
          setTimeout(() => {
            window.location.reload()
          }, 3000)
        }
    },
    complete: function (responseJSON) {
    },
    error: function (xhr, status, p3, p4) {
        var err = "Error " + " " + status + " " + p3 + " " + p4;
        if (xhr.responseText && xhr.responseText[0] == "{")
            err = JSON.parse(xhr.responseText).Message;
        iziToast.error({
          title: 'Gagal Menyimpan Data',
          message: `${err}`,
          position: 'topRight'
        })
        $('#addUserModal').modal('hide');
        return false;
    }
  }).fail(function (responseJSON, result, data) {
      // ignore the error and do nothing else
      iziToast.error({
        title: 'Gagal Menyimpan Data',
        message: `${responseJSON.responseJSON.message}`,
        position: 'topRight'
      })        
  });
});

async function deleteUser(id){
  var result = confirm("Are you sure to delete this data?");
  if (result) 
    $.ajax({
      url: `${urlData}user/deleteUser/` + id,
      type: 'DELETE',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": getCookie("session")
      },
      processData: false,
      beforeSend: function () {
          document.getElementById("overlay").removeAttribute("hidden");
      },
      success: function (result) {
          // element is div holding the ParticalView
          document.getElementById("overlay").setAttribute("hidden", false);
          iziToast.info({
            title: 'Delete Successfully',
            message: `${result.message}`,
            position: 'topRight'
          })
      },
      complete: function (responseJSON) {
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      },
      error: function (xhr, status, p3, p4) {
          var err = "Error " + " " + status + " " + p3 + " " + p4;
          if (xhr.responseText && xhr.responseText[0] == "{")
              err = JSON.parse(xhr.responseText).Message;
          iziToast.error({
            title: 'Delete Data Unsuccessfully',
            message: `${err}`,
            position: 'topRight'
          })
          return false;
      }
    });
}

function openEditModal(id){
  $.ajax({
    url: `${urlData}user/getUser/` + id,
    type: 'GET',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": getCookie("session")
    },
    processData: false,
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
    },
    success: function (result) {
        // element is div holding the ParticalView
        document.getElementById('editFormData').innerHTML = 
        `
          <div class="col-12 col-md-12 col-lg-12">
          <div class="card">        
            <div class="card-body">
              <div class="form-group">
                <label>Nama</label>
                <input type="text" class="form-control" id="usernameEdit" required="" autocomplete="off" placeholder="Nama" Value="${result.data.name}">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-control" id="useremailEdit" required="" autocomplete="off" placeholder="contoh@gmail.com" Value="${result.data.email}">
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="text" class="form-control" id="userpasswordEdit" required="" autocomplete="off" placeholder="*****" Value="${result.data.password}">
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="number" maxLength="14" oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" class="form-control" id="userPhoneEdit" required="" autocomplete="off" placeholder="Nomer Telepon" Value="${result.data.phoneNumber}">
              </div>
              <div class="form-group">
                <label>Role</label>
                <select class="form-control" id="useroleEdit" required="" placholder="--Select Data--">
                  ${result.data.role == false ? `<option value="">--Select Data--</option>
                  <option value="Admin" selected>Admin</option>
                  <option value="Super Admin">Super Admin</option>` : result.data.role == true ? `<option value="">--Select Data--</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin" selected>Super Admin</option>` : `<option value="" selected>--Select Data--</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>`}
                </select>
              </div>
              <div class="form-group">
                <label>User Status</label>
                <select class="form-control" id="userstatusEdit" required="" placholder="--Select Data--">
                  ${result.data.active == true ? `<option value="">--Select Data--</option>  
                  <option Value="Active" selected>Active</option>
                  <option Value="Not Active">Not Active</option>` : result.data.active == false ? `<option value="">--Select Data--</option>  
                  <option Value="Active">Active</option>
                  <option Value="Not Active" selected>Not Active</option>` : `<option value="" selected>--Select Data--</option>  
                  <option Value="Active">Active</option>
                  <option Value="Not Active">Not Active</option>`}
                </select>
              </div>
            </div>
          </div>
          <div class="text-right">
            <button class="btn btn-sm btn-danger mr-1" data-dismiss="modal">Close</button>
            <button class="btn btn-sm btn-primary" onClick="editData(${result.data.id})">Save</button>        
          </div>
        </div>
        `
    },
    complete: function (responseJSON) {
      document.getElementById("overlay").setAttribute("hidden", false);
      $('#editUserModal').modal('show')
    },
    error: function (xhr, status, p3, p4) {
        var err = "Error " + " " + status + " " + p3 + " " + p4;
        if (xhr.responseText && xhr.responseText[0] == "{")
            err = JSON.parse(xhr.responseText).Message;
        iziToast.error({
          title: 'Open Modal Unsuccessfully',
          message: `${err}`,
          position: 'topRight'
        })
        return false;
    }
  });
}

function editData(id){
  $('#editFormData').on("submit", function(e){
    e.preventDefault()
  
    var name = document.getElementById('usernameEdit').value
    var userEmail = document.getElementById('useremailEdit').value
    var userPhone =  document.getElementById('userPhoneEdit').value
    var userPassword = document.getElementById('userpasswordEdit').value
    var userRole =  document.getElementById('useroleEdit').value
    var userStatus =  document.getElementById('userstatusEdit').value

    const data = { 
      name: name.toUpperCase(),
      email: userEmail,
      password: userPassword,
      phoneNumber: userPhone.toString(),
      role: userRole == "Admin" ? false : true,
      active: userStatus == "Active"? true : false
    };

    $.ajax({
      url: `${urlData}user/update/` + id,
      type: 'PUT',
      headers: {
        "Authorization": getCookie("session")
      },
      data: JSON.stringify(data),
      datatype: 'json',
      contentType: 'application/json',
      beforeSend: function () {
          document.getElementById("overlay").removeAttribute("hidden");
      },
      success: function (result) {
          // element is div holding the ParticalView
          $('#editUserModal').modal('hide');
          document.getElementById("overlay").setAttribute("hidden", false);
          iziToast.success({
            title: 'Update Data Berhasil',
            message: `Data dengan nama ${result.data.name} berhasil diubah`,
            position: 'topRight'
          })
          //store result.data.token ke cookies bagian ini
          //pindah halaman ke dashboard
      },
      complete: function (responseJSON) {
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      },
      error: function (xhr, status, p3, p4) {
          var err = "Error " + " " + status + " " + p3 + " " + p4;
          if (xhr.responseText && xhr.responseText[0] == "{")
              err = JSON.parse(xhr.responseText).Message;
          iziToast.error({
            title: 'Update data tidak berhasil',
            message: `${err}`,
            position: 'topRight'
          })
          $('#addUserModal').modal('hide');
          return false;
      }
    });
  }); 
}


