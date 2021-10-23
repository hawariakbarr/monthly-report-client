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
          getDataOpd(urlData)
          getDataTable(urlData)
          getDataBandwith(urlData)
          getDataIsp(urlData)
          getDataUptd(urlData)
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
  var prtgId = document.getElementById('prtgId').value
  var listUptd = document.getElementById('listUptd').value
  var listIsp = document.getElementById('listIsp').value
  var listBandwith =  document.getElementById('listBandwith').value
  
  //Obj of data to send in future like a dummyDb
  const data = { 
    prtg_id: parseInt(prtgId),
    uptd_id: parseInt(listUptd),
    isp_id: parseInt(listIsp),
    band_id: parseInt(listBandwith)
  };

  $.ajax({
    url: `${urlData}report/add-uptd-link`,
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
          iziToast.success({
            title: 'Uptd link Berhasil Ditambahkan',
            message: `Uptd link dengan prtg-id ${result.data.prtg_id} Berhasil Disimpan`,
            position: 'topRight'
          })
          $('#addModal').modal('hide');
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

async function getDataTable(urlData){
    await $.ajax({
      url: `${urlData}report/get-uptd-link`,
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
                <th style="width:250px">Nama UPTD</th>
                <th>PRTG ID</th>
                <th>ISP</th>
                <th>Bandwith</th>
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
              <td>${element.uptd_name}</td>
              <td>${element.prtg_id}</td>
              <td>${element.isp}</td>
              <td>${element.bandwith}</td>
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
      async: false,
      url: `${urlData}report/get-uptd-link/` + id,
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
                <label>PRTG</label>
                <input type="number" class="form-control" id="prtgEdit" required="" autocomplete="off" placeholder="ID PRTG" Value="${result.data.prtg_id}">
              </div>
              <div class="form-group">
                <label>Nama Uptd</label>
                <select class="form-control" id="listuptdEdit" name="uptd name" required placholder="--Select Uptd--">
                  <option value="" selected>--Select Data--</option>  
                </select>
              </div>
              <div class="form-group">
                <label>ISP</label>
                <select class="form-control" id="listispEdit" name="isp name" required placholder="--Select ISP--">
                  <option value="" selected>--Select Data--</option>  
                </select>
              </div>
              <div class="form-group">
                <label>Bandwith</label>
                <select class="form-control" id="listbandwithEdit" name="bandwith" required placholder="--Select Bandwith--">
                  <option value="" selected>--Select Data--</option>  
                </select>
              </div>
            </div>
            <div class="text-right">
              <button class="btn btn-sm btn-danger mr-1" data-dismiss="modal">Close</button>
              <button class="btn btn-sm btn-primary" onClick="editData(${result.data.id})">Save</button>        
            </div>
          </div>
          `

          $.ajax({
            async:false,
            url: urlData + 'report/get-band-list',
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
                  $('#listbandwithEdit').append(`<option value="${element.id}">${element.bandwith} Mbps</option>`);
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
  
          $.ajax({
            async:false,
            url: urlData + 'report/get-isp-name',
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
                  $('#listispEdit').append(`<option value="${element.id}">${element.name}</option>`);
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
  
          $.ajax({
            async:false,
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
                  $('#listuptdEdit').append(`<option value="${element.id}">${element.name}</option>`);
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

      },
      complete: function (responseJSON) {
        document.getElementById("overlay").setAttribute("hidden", false);
        $('#editModal').modal('show')
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
      $(`#listispEdit option[value=${result.data.isp_id}]`).attr('selected','selected');
      $(`#listbandwithEdit option[value=${result.data.band_id}]`).attr('selected','selected');
      $(`#listuptdEdit option[value=${result.data.uptd_id}]`).attr('selected','selected');

      $("#listuptdEdit").select2({
        dropdownParent: $("#editModal")
      });    
    });
}

function editData(id){
    $('#editFormData').on("submit", function(e){
        e.preventDefault()

        var prtgIdEdit = document.getElementById('prtgEdit').value
        var listUptdEdit = document.getElementById('listuptdEdit').value
        var listIspEdit = document.getElementById('listispEdit').value
        var listBandwithEdit =  document.getElementById('listbandwithEdit').value
        
        //Obj of data to send in future like a dummyDb
        const data = { 
          prtg_id: parseInt(prtgIdEdit),
          uptd_id: parseInt(listUptdEdit),
          isp_id: parseInt(listIspEdit),
          band_id: parseInt(listBandwithEdit)
        };

        $.ajax({
        url: `${urlData}report/update-uptd-link/` + id,
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
                title: 'Update Data Berhasil',
                message: `Data dengan prtg-id ${result.data.prtg_id} berhasil diubah`,
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
        url: `${urlData}report/delete-uptd-link/` + id,
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


async function getDataBandwith(urlData){
  await $.ajax({
    url: urlData + 'report/get-band-list',
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
          $('#listBandwith').append(`<option value="${element.id}">${element.bandwith} Mbps</option>`);
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


async function getDataIsp(urlData){
  await $.ajax({
    url: urlData + 'report/get-isp-name',
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
          $('#listIsp').append(`<option value="${element.id}">${element.name}</option>`);
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


async function getDataOpd(urlData){
  await $.ajax({
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
          $('#listOpd').append(`<option value="${element.id}">${element.name}</option>`);
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

async function getDataUptd(urlData){
  await $.ajax({
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
          $('#listUptd').append(`<option value="${element.id}">${element.name}</option>`);
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
