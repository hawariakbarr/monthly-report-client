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
    }else{
      document.getElementById("userMenu").removeAttribute("hidden");
    }
    fetch("../env.json")
        .then(response => response.json())
        .then(json => urlData = json[0].local_url)
        .then(function(){
          getDataOpd(urlData, 'listOpd')
          getDatatable(urlData)
          getDataUptd(urlData, 'listUptd')
          getDataComplaint(urlData, 'listComplaint')
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

const userForm = document.getElementById("formData");
userForm.addEventListener("submit", function(e){  
  e.preventDefault();
  var listOpd = document.getElementById('listOpd').value
  var listComplaint = document.getElementById('listComplaint').value
  var monthName = document.getElementById('monthName').value
  var amountInsident =  document.getElementById('amountInsident').value
  
  //Obj of data to send in future like a dummyDb
  const data = { 
    opd_id: parseInt(listOpd),
    comp_id: parseInt(listComplaint),
    month: parseInt(monthName.slice(-2)),
    amount: parseInt(amountInsident)
  };

  $.ajax({
    url: `${urlData}insident/add-opd-insident`,
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
          $('#addModal').modal('hide');
          console.log(result.data)
          iziToast.success({
            title: 'Keluhan OPD Berhasil Ditambahkan',
            message: `Keluhan OPD Dengan kategori ${result.data.complaint} Berhasil Disimpan`,
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
        $('#addModal').modal('hide');
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

async function getDatatable(urlData){
    await $.ajax({
      url: `${urlData}insident/get-all-opd-insident`,
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
                <th style="width: 330px;">Nama OPD</th>
                <th>Jenis Keluhan</th>
                <th style="text-align: center;">Jumlah Keluhan</th>
                <th>Bulan</th>
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
              <td>${element.opd_name}</td>
              <td>${element.complaint}</td>
              <td align="center">${element.amount}</td>
              <td>${getMonthName(element.month)}</td>
              <td>
                <button class="btn btn-info btn-sm btn-icon  mr-1" id="editBTn" data-toggle="tooltip" title="Edit" data-original-title="Edit" onClick="openEditModal(${element.id})"><i class="fas fa-pencil-alt fa-sm" style=" color:white"></i></button>
                <button class="btn btn-danger btn-sm btn-icon" data-toggle="tooltip" title="Delete" onClick="deleteData(${element.id})" ><i class="fas fa-trash fa-sm" style=" color:white"></i></button>
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
      url: `${urlData}insident/get-opd-insident/` + id,
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
                  <label>Nama OPD</label>
                  <select class="form-control select2" id="listeditOpd" name="opd name" required placholder="--Select OPD--">
                    <option value="" selected>--Select Data--</option>  
                  </select>
                </div>
                <div class="form-group">
                  <label>Jenis Keluhan</label>
                  <select class="form-control select2" id="listeditComplaint" name="complaint name" required placholder="--Select Complaint--">
                    <option value="" selected>--Select Data--</option>  
                  </select>
                </div>                       
                <div class="form-group">
                  <label>Bulan</label>
                  <select class="form-control select2" id="editmonthName" name="month name" required placholder="--Select Month--">
                    <option value="" selected>--Select Data--</option>  
                    <option value="1">Januari</option> 
                    <option value="2">Februari</option> 
                    <option value="3">Maret</option> 
                    <option value="4">April</option>
                    <option value="5">Mei</option>
                    <option value="6">Juni</option> 
                    <option value="7">July</option> 
                    <option value="8">Agustus</option> 
                    <option value="9">September</option> 
                    <option value="10">Oktober</option> 
                    <option value="11">November</option> 
                    <option value="12">Desember</option> 
                  </select>
                </div>
                <div class="form-group">
                  <label>Jumlah Keluhan</label>
                  <div class="number amount-complaint">
                    <span class="minus">-</span>
                    <input type="text" value="" id="amountinsidentEdit" required="" autocomplete="off"  required/>
                    <span class="plus">+</span>
                  </div>
                </div>
              </div>
            </div>
          
            <div class="text-right">
              <button class="btn btn-sm btn-danger mr-1" data-dismiss="modal">Close</button>
              <button class="btn btn-sm btn-primary" onclick="editData(${result.data.id})">Submit</button>        
            </div>
          </div>
          `
          $('#editModal').modal('show')
          getDataComplaint(urlData, 'listeditComplaint')
          getDataOpd(urlData, 'listeditOpd')

        
          $("#listeditOpd").select2({
            dropdownParent: $("#editModal")
          });    
          
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
      $(`#listeditOpd option[value=${result.data.opd_id}]`).attr('selected','selected');
      $(`#listeditComplaint option[value=${result.data.comp_id}]`).attr('selected','selected');
      $(`#editmonthName option[value=${result.data.month}]`).attr('selected','selected');
      $('#amountinsidentEdit').val(result.data.amount)
      
      $(document).ready(function() {
        $('.minus').click(function () {
          var input = $(this).parent().find('input');
          var count = parseInt(input.val()) - 1;
          count = count < 1 ? 0 : count;
          input.val(count);
          input.change();
          return false;
        });
        $('.plus').click(function () {
          var input = $(this).parent().find('input');
          if (input.val() == ''){
            input.val('0')
          }
          input.val(parseInt(input.val()) + 1);
          input.change();
          return false;
        });
      });

      $('#editModal').on('hidden.bs.modal', function (e) {
        $(this)
          .find("input,textarea,select")
            .val('')
            .end()
          .find("input[type=checkbox], input[type=radio]")
            .prop("checked", "")
            .end();
      })

    });
}

function editData(id){
    $('#editFormData').on("submit", function(e){
        e.preventDefault()

        var editlistOpd = document.getElementById('listeditOpd').value
        var editlistComplaint = document.getElementById('listeditComplaint').value
        var editmonthName =  document.getElementById('editmonthName').value
        var editamountInsident = document.getElementById('amountinsidentEdit').value

        const data = { 
            opd_id: parseInt(editlistOpd),
            comp_id: parseInt(editlistComplaint),
            month: parseInt(editmonthName),
            amount: parseInt(editamountInsident)
        };

        $.ajax({
        url: `${urlData}insident/update-opd-insident/` + id,
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
            $('#editModal').modal('hide');
            document.getElementById("overlay").setAttribute("hidden", false);
            iziToast.success({
                title: 'Update Data Keluhan Berhasil',
                message: `Keluhan UPTD Dengan kategori ${result.data.complaint} Berhasil Disimpan`,
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
                title: 'Update data keluhan tidak berhasil',
                message: `${err}`,
                position: 'topRight'
            })
            $('#editModal').modal('hide');
            return false;
        }
        });
    }); 
}

async function deleteData(id){
    var result = confirm("Are you sure to delete this data?");
    if (result) 
        $.ajax({
        url: `${urlData}insident/delete-opd-insident/` + id,
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

function getDataUptd(urlData, listId){
  $.ajax({
    async: false,
    url: urlData + 'report/get-uptd-name',
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
          $(`#${listId}`).append(`<option value="${element.id}">${element.name}</option>`);
        }); 
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

function getMonthName(monthInt){
  const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  return monthNames[parseInt(monthInt)]
}

function getDataComplaint(urlData, listId){
  $.ajax({
    async: false,
    url: urlData + 'report/get-complaint-name',
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
        $(`#${listId}`).append(`<option value="${element.id}">${element.category}</option>`);
      }); 
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

$(document).ready(function() {
  $('.minus').click(function () {
    var input = $(this).parent().find('input');
    var count = parseInt(input.val()) - 1;
    count = count < 1 ? 0 : count;
    input.val(count);
    input.change();
    return false;
  });
  $('.plus').click(function () {
    var input = $(this).parent().find('input');
    if (input.val() == ''){
      input.val('0')
    }
    input.val(parseInt(input.val()) + 1);
    input.change();
    return false;
  });
});

$('#addModal').on('hidden.bs.modal', function (e) {
  $(this)
    .find("input,textarea,select")
       .val('')
       .end()
    .find("input[type=checkbox], input[type=radio]")
       .prop("checked", "")
       .end();
})