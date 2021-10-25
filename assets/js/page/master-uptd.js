"use strict";

var urlData = ''
var start_date = ''
var end_date = ''
var dt_after_isp = ''
var dt_month = ''

window.onload = function() {
  if(getCookie('session') != 'Who Are You?')
  {
    if(getCookie("role") == "false"){
      document.getElementById("userMenu").setAttribute("hidden", true);
      location.replace("errors-403.html")
    }else{
      document.getElementById("userMenu").removeAttribute("hidden");
    }
    fetch("../env.json")
        .then(response => response.json())
        .then(json => urlData = json[0].local_url)
        .then(function(){
          getDataOpd(urlData, 'opdName')
          getDatatableUptd(urlData)
        });
  }
  else{
    location.replace("auth-login.html")
  }
};

const getCookie = (cookie_name) =>{
  // Construct a RegExp object as to include the variable name
  const re = new RegExp(`(?<=${cookie_name}=)[^;]*`);
  try{
    return document.cookie.match(re)[0];	// Will raise TypeError if cookie is not found
  }catch{
    return "Who Are You?";
  }
}

const userForm = document.getElementById("uptdFormData");
userForm.addEventListener("submit", function(e){  
  e.preventDefault();
  var uptdName = document.getElementById('uptdName').value
  var uptdAddress = document.getElementById('uptdAddress').value
  var uptdPic = document.getElementById('uptdPic').value
  var uptdPhone =  document.getElementById('uptdPhone').value
  var opdId =  document.getElementById('opdName').value
  
  //Obj of data to send in future like a dummyDb
  const data = { 
    name: uptdName,
    address: uptdAddress,
    pic: uptdPic,
    opd_id : parseInt(opdId),
    phone_number: uptdPhone
  };

  $.ajax({
    async: false,
    url: `${urlData}report/add-uptd`,
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
          $('#addUptdModal').modal('hide');
          iziToast.success({
            title: 'UPTD Berhasil Ditambahkan',
            message: `UPTD Dengan Nama ${result.data.name} Berhasil Disimpan`,
            position: 'topRight'
          })
          setTimeout(() => {
            window.location.reload()
          }, 1500)
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
        $('#addUptdModal').modal('hide');
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

function getDatatableUptd(urlData){
    $.ajax({
      async: false,
      url: `${urlData}report/get-uptd-all`,
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
                <th>Nama UPTD</th>
                <th>Alamat</th>
                <th>Nama OPD</th>
                <th>PIC</th>
                <th>No Hp</th>
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
              <td>${element.address}</td>
              <td>${element.opd_name}</td>
              <td>${element.pic}</td>
              <td>${element.phone_number}</td>
              <td>
                <button class="btn btn-info btn-sm btn-icon  mr-1" id="editBTn" data-toggle="tooltip" title="Edit" data-original-title="Edit" onClick="openEditModal(${element.id})"><i class="fas fa-pencil-alt fa-sm" style=" color:white"></i></button>
                <button class="btn btn-danger btn-sm btn-icon" data-toggle="tooltip" title="Delete" onClick="deleteUptd(${element.id})" ><i class="fas fa-trash fa-sm" style=" color:white"></i></button>
              </td>
            </tr>
          `
        }); 
        document.getElementById('table-here').innerHTML = headTable + listData + tailTable; 
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

function openEditModal(id){
    $.ajax({
      async: false,
      url: `${urlData}report/get-uptd/` + id,
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
                  <label>Nama UPTD</label>
                  <input type="text" class="form-control" id="uptdnameEdit" required="" autocomplete="off" placeholder="Nama OPD" Value="${result.data.name}">
                </div>
                <div class="form-group">
                  <label>Alamat</label>
                  <input type="text" class="form-control" id="addressEdit" required="" autocomplete="off" placeholder="Masukan Alamat" Value="${result.data.address}">
                </div>
                <div class="form-group">
                  <label>Nama OPD</label>
                  <select class="form-control" id="opdnameEdit" name="opdnameEdit" required placholder="--Select OPD--">
                    <option value="" selected>--Select Data--</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>PIC</label>
                  <input type="text" class="form-control" id="picEdit" autocomplete="off" placeholder="Masukan Nama PIC" Value="${result.data.pic}">
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="number" maxLength="14" oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" class="form-control" id="userPhoneEdit" autocomplete="off" placeholder="Nomer Telepon" Value="${result.data.phone_number}">
                </div>
            </div>
            <div class="text-right">
              <button class="btn btn-sm btn-danger mr-1" data-dismiss="modal">Close</button>
              <button class="btn btn-sm btn-primary" onClick="editData(${result.data.id})">Save</button>        
            </div>
          </div>
          `
          $('#editUptdModal').modal('show')
          getDataOpd(urlData, 'opdnameEdit')
      },
      complete: function (responseJSON) {
        document.getElementById("overlay").setAttribute("hidden", false);
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
    }).done(function(result){
      $(`#opdnameEdit option[value=${result.data.opd_id}]`).attr('selected','selected');
      $("#opdnameEdit").select2({
        dropdownParent: $("#editUptdModal")
      });
    });    
}

function editData(id){
    $('#editFormData').on("submit", function(e){
        e.preventDefault()

        var name = document.getElementById('uptdnameEdit').value
        var address = document.getElementById('addressEdit').value
        var pic =  document.getElementById('picEdit').value
        var phoneNumber = document.getElementById('userPhoneEdit').value
        var opdId = document.getElementById('opdnameEdit').value

        const data = { 
            name: name,
            address: address,
            pic: pic,
            opd_id: parseInt(opdId),
            phone_number: phoneNumber.toString()
        };

        $.ajax({
        async: false,
        url: `${urlData}report/update-uptd/` + id,
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
            }, 1500)
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
            $('#editUserModal').modal('hide');
            return false;
        }
        });
    }); 
}

function deleteUptd(id){
    var result = confirm("Are you sure to delete this data?");
    if (result) 
        $.ajax({
        async: false,
        url: `${urlData}report/delete-uptd/` + id,
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

function getDataOpd(urlData, listId){
  $.ajax({
    async: false,
    url: urlData + 'report/get-opd-name',
    type: 'GET',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
    },
    success: function (result) {      
      if(result.data.length > 0)
        result.data.forEach((element, index) => {
          console.log(element.name)
          $(`#${listId}`).append(`<option value="${element.id}">${element.name}</option>`);
        }); 
    },
    complete: function () {
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
        var err = "Error " + " " + status + " " + p3 + " " + p4;
        if (xhr.responseText && xhr.responseText[0] == "{")
            err = JSON.parse(xhr.responseText).Message;
        iziToast.error({
          title: 'Gagal load data',
          message: `${err}`,
          position: 'topRight'
        })
        return false;
    }
  });
}

function getDataUptd(id){
  $.ajax({
    async: false,
    url: urlData + 'report/get-uptd-name/' + id,
    type: 'GET',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
        $('#selectUptd').prop("disabled", false); // Element(s) are now enabled.
    },
    success: function (result) {       
      if(result.data.length > 0 && id != "all")
      {
        $('#selectUptd').empty()
        $('#selectUptd').append(`<option value="">--Select--</option>`);
        $('#selectUptd').append(`<option value="all">Select All</option>`);
        $('#selectUptd').append(`<option value="none">None</option>`); 
        result.data.forEach((element, index) => {
          $('#selectUptd').append(`<option value="${element.id}">${element.name}</option>`);
        }); 
      }
      else if(result.data.length <= 0 && id != "all"){
        $('#selectUptd').empty()
        $('#selectUptd').append(`<option value="">--Select--</option>`);
        $('#selectUptd').append(`<option value="none">None</option>`);
      }else if(id == "all"){
        $('#selectUptd').empty()
        $('#selectUptd').append(`<option value="">--Select--</option>`);
        $('#selectUptd').append(`<option value="all">Select All</option>`);
        $('#selectUptd').append(`<option value="none">None</option>`); 
      }
      
    },
    complete: function (responseJSON) {      
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
        var err = "Error " + " " + status + " " + p3 + " " + p4;
        if (xhr.responseText && xhr.responseText[0] == "{")
            err = JSON.parse(xhr.responseText).Message;
        iziToast.error({
          title: 'Gagal load data',
          message: `${err}`,
          position: 'topRight'
        })
        return false;
    }
  });
}

$('.daterange-cus').daterangepicker({
  locale: {format: 'YYYY-MM-DD'},
  drops: 'down',
  opens: 'right'
});
$('.daterange-btn').daterangepicker({
  ranges: {
    'Select Range'       : [],
    'Daily'       : [moment(), moment().add('day', 1)],
    'Monthly'  : [moment().startOf('month'), moment().endOf('month').add('day', 1)]
  },
  // startDate: moment().subtract(29, 'days'),
  // endDate  : moment()
}, function (start, end, label) {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const d = new Date(start);
  dt_month = monthNames[d.getMonth()]
  console.log(dt_month)
  alert(label + ' Date Selected ' + start.format('YYYY-MM-DD').toString() + '-00-00-00' +' Until '+  end.format('YYYY-MM-DD').toString() + '-00-00-00')
  start_date = start.format('YYYY-MM-DD').toString() + '-00-00-00'
  end_date = end.format('YYYY-MM-DD').toString() + '-00-00-00'
  var tempdiff = Math.abs(new Date(end) - new Date(start));
  var diff = tempdiff/86400000
  if(label == 'Daily' || diff == 1.9999999884259259){
    dt_after_isp = start.format('DD/MM/YYYY').toString()
  }
});

// 2021-9-01-00-00-00

$(".inputtags").tagsinput('items');
