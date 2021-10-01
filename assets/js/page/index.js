"use strict";

var urlData = ''
window.onload = function() {
  if(document.cookie.length > 0 )
  {
    fetch("../env.json")
        .then(response => response.json())
        .then(json => urlData = json[0].local_url)
        .then(function(){
          getData(urlData)
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
    return "this-cookie-doesn't-exist";
  }
}
async function getData(urlData){
  await $.ajax({
    url: urlData + 'guest/getAll',
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
              <th>Instansi</th>
              <th style="text-align:center">Waktu Kedatangan</th>
              <th style="text-align:center">Waktu Kepulangan</th>
              <th style="text-align:center">Status</th>
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
      if(result.data.length > 0)
        result.data.forEach((element, index) => {
          listData += `
            ${element.active? `
            <tr>
              <td>${element.name}</td>
              <td>${element.institution}</td>
              <td style="text-align: center">${element.arrivalTime}</td>
              <td style="text-align: center">${element.departureTime == null || element.departureTime == 'None'? "-" : element.departureTime}</td>
              <td>${element.departureTime == null || element.departureTime == 'None' ? 
                '<div class="badge badge-warning">In Progress</div>' : '<div class="badge badge-success">Completed</div>'}
              </td>
              <td>
                <div class="buttons">
                ${getCookie("role") == "true" ? `<button class="btn btn-primary btn-sm btn-icon mr-2" id="detailBtn" data-toggle="tooltip" title="Export PDF" onClick="guestById(${element.id})"><i class="fas fa-list-alt fa-sm" style=" color:white"></i></button>
                <button class="btn btn-info btn-sm btn-icon  mr-1" id="editBTn" data-toggle="tooltip" title="Edit" data-original-title="Edit" onClick="openEditForm(${element.id})"><i class="fas fa-pencil-alt fa-sm" style=" color:white"></i></button>
                <button class="btn btn-danger btn-sm btn-icon" data-toggle="tooltip" title="Delete" onClick="deleteNDA(${element.id})"><i class="fas fa-trash fa-sm" style=" color:white"></i></button>` : 
                `<button class="btn btn-primary btn-sm btn-icon mr-2" id="detailBtn" data-toggle="tooltip" title="Export PDF" onClick="guestById(${element.id})"><i class="fas fa-list-alt fa-sm" style=" color:white"></i></button>
                <button class="btn btn-info btn-sm btn-icon  mr-1" id="editBTn" data-toggle="tooltip" title="Edit" data-original-title="Edit" onClick="openEditForm(${element.id})"><i class="fas fa-pencil-alt fa-sm" style=" color:white"></i></button>`}
                </div>
              </td>
            </tr>
              ` : ''}
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
          title: 'Gagal load data',
          message: `${err}`,
          position: 'topRight'
        })
        return false;
    }
  });
}

async function deleteNDA(id){
  var result = confirm("Are you sure to delete this data?");
  if (result) 
    $.ajax({
      url: `${urlData}guest/deleteGuest/` + id,
      type: 'PUT',
      contentType: 'application/json',
      headers: {
        "Authorization": getCookie("session")
      },
      data: JSON.stringify({
                "active" : false
              }),
      beforeSend: function () {
          document.getElementById("overlay").removeAttribute("hidden");
      },
      success: function (result) {
        iziToast.info({
          title: 'Delete Successfully',
          message: `${result.message}`,
          position: 'topRight'
        })
      },
      complete: function (responseJSON) {
        document.getElementById("overlay").setAttribute("hidden", false);
        setTimeout(() => {
          window.location.reload();
        }, 5000)
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
          setTimeout(() => {
            window.location.reload();
          }, 5000)
          return false;
      }
    });
}

function openEditForm(id){
  $.ajax({
    url: `${urlData}guest/getGuest/` + id, //ambil data sesuai id
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
      window.localStorage.setItem("id",`${result.data.id}`);
      location.replace("nda-form-edit.html")
    },
    complete: function (responseJSON) {
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
      document.getElementById("overlay").setAttribute("hidden", false);
      var err = "Error " + " " + status + " " + p3 + " " + p4;
      if (xhr.responseText && xhr.responseText[0] == "{")
          err = JSON.parse(xhr.responseText).Message;
      iziToast.error({
        title: 'Open Form Data Unsuccessfully',
        message: `${err}`,
        position: 'topRight'
      })
      return false;
    }
  });  
}

function editFormData(id){
  $('#editFormData').on("submit", function(e){
    e.preventDefault()
    var nama = document.getElementById('nameEdit').value
    var email = document.getElementById('emailEdit').value
    var nik = document.getElementById('nikEdit').value
    var instansi =  document.getElementById('instansiEdit').value
    var phone =  document.getElementById('phonenumberEdit').value
    var kepKunjungan =  document.getElementById('kepKunjunganEdit').value
    var wKedatangan =  document.getElementById('waktukedatanganEdit').value
    var wKepulangan =  document.getElementById('waktukepulanganEdit').value
    // var ktpImage =  document.getElementById('waktukepulanganEdit').value
    // var signImage =  document.getElementById('waktukepulanganEdit').value
    //Obj of data to send in future like a dummyDb

    const data = { 
      name:nama.toUpperCase(),
      email:email,
      nik:String(nik),
      institution:instansi.toUpperCase(),
      phoneNumber:String(phone).trim(),
      visitReason:kepKunjungan,
      arrivalTime:wKedatangan,
      departureTime:wKepulangan,
      ktpImage:ktpImgName, //
      signImage:ttdImage
    };

    $.ajax({
    url: `${urlData}/guest/update/` + id,
    type: 'PUT',
    data: JSON.stringify(data),
    contentType: 'application/json',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
    },
    success: function (result) {
        // element is div holding the ParticalView
        $('#editUserModal').modal('hide');
        document.getElementById("overlay").setAttribute("hidden", false);
        iziToast.success({
          title: 'Update Data Successfully',
          message: `Data with name ${result.name} has been updated`,
          position: 'topRight'
        })
    },
    complete: function (responseJSON) {
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    },
    error: function (xhr, status, p3, p4) {
        var err = "Error " + " " + status + " " + p3 + " " + p4;
        if (xhr.responseText && xhr.responseText[0] == "{")
            err = JSON.parse(xhr.responseText).Message;
        iziToast.error({
          title: 'Update Data Unsuccessfully',
          message: `${err}`,
          position: 'topRight'
        })
        $('#addUserModal').modal('hide');
        window.location.reload()
        return false;
    }
  });
  }); 
}

function closeModal(){
  $('#editModal').modal("hide")
}

function resetForm() {
  document.getElementById("editFormData").reset();
  document.getElementById('image-preview').style.backgroundImage='';
}

var element = {}, dataPrint = [];
function guestById(id){
  $.ajax({
    async:false,
    url: `${urlData}guest/getGuest/` + id,
    type: 'GET',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
    },
    success: function (result) {
      const d = new Date();
      const months = ["Januari","Februari","Maret","April","Mai","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      
      element.ktp = `${urlData}uploads/ktp/${result.data.ktpImage}`
      element.sign = `${urlData}uploads/ttd/${result.data.signImage}`
      element.name = result.data.name
      element.date = `Bandung, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      element.number_form = `${d.getFullYear()}/${result.data.sr_number}/e-Gov`
      element.sr_number = result.data.sr_number
      dataPrint.push(element)

      console.log(dataPrint)
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
  printPDF()
}

function printPDF(){
  //Open new dialog window
  var myWindow=window.open('','','width=1200,height=1000');
  //Generate string html file
    var sHtml = `<div id='content'>
          <p align='right' style='font-family: Arial; font-size: 13px'>
          No Form : ${dataPrint[0].number_form}
          </p>
          <table style='width: 100%; border: 0.5px solid black; border-collapse: collapse;'>
          <tr>
            <td style='width: 20%; border: 0.5px solid black; border-collapse: collapse; font-family: Arial' align='center'>
            <img src='https://i1.wp.com/www.desaintasik.com/wp-content/uploads/2018/02/logoprovjabarwarna-desaintasik.com_.png?resize=241%2C282' style='max-width:83px;
          max-height:90px;
          width:auto;
          height:auto;'>
            </td>
            <td style='width: 60%; border: 0.5px solid black; border-collapse: collapse; font-family: Arial; font-size: 21px' align='center'><b>FORMULIR NDA</b> <br> <i>(Non Disclosure Agreement)</i></td>
            <td style='width: 30%; border: 0.5px solid black; border-collapse: collapse; font-family: Arial; font-size: 12px' align='center'>No. Urut: ${dataPrint[0].sr_number} </td>
          </tr>
          </table>
          <p align='center' style='font-family: Arial; font-size: 19px;'>
          <b>PERNYATAAN MENJAGA KERAHASIAAN</b>
          </p>
          <p style='font-family: Arial; font-size: 15px; text-align:justify'>
          Sehubungan dengan tugas dan pekerjaan saya dalam memberikan dukungan layanan TI, saya dapat saja melakukan akses informasi atau sistem yang berklasifikasi "Rahasia/Penting/Strategis" atau melakukan akses lokasi yang mengandung perangkat kritikal milik Dinas Komunikasi dan Informatika Provinsi Jawa Barat.
          </p>
          <p style='display: flex; font-family: Arial; font-size: 15px; text-align:justify; margin-bottom: 5px;'>
          Informasi "Rahasia/Penting/Strategis" milik Dinas Komunikasi dan Informatika Provinsi Jawa Barat dapat berupa dokumen tercetak (hardcopy) atau file elektronik (softcopy), yang meliputi antara lain:
          </p>
          <table style='display: flex; font-family: Arial; font-size: 15px;'>
          <tr>
            <td>a.</td>
            <td>Data pribadi pegawai;</td>
          </tr>
          <tr>
            <td>b.</td>
            <td>Konfigurasi IT dan IP address;</td>
          </tr>
          <tr>
            <td>c.</td>
            <td>Password;</td>
          </tr>
          <tr>
            <td>d.</td>
            <td>Kode program (source code);</td>
          </tr>
          <tr>
            <td>e.</td>
            <td>Hasil scanning vulnerability/penetration testing;</td>
          </tr>
          <tr>
            <td>f.</td>
            <td>Hasil kajian risiko (risk assesssment) dan hasil audit;</td>
          </tr>
          <tr>
            <td>g.</td>
            <td>Data lelang;</td>
          </tr>
          <tr>
            <td style='vertical-align: top; text-align:justify'>h.</td>
            <td>Data/Informasi berkategori â€œSensitif/Kritikal/Rahasia' lainnya milik Dinas Komunikasi dan Informatika Provinsi Jawa Barat;</td>
          </tr>
          </table>
          <p style='font-family: Arial; font-size: 15px; text-align:justify; margin-bottom: 5px;'>
          Oleh karena itu, saya setuju untuk:
          </p>
          <table style='font-family: Arial; font-size: 15px;'>
          <tr>
            <td style='vertical-align: top; text-align:justify'>1.</td>
            <td style='text-align:justify;'>Tidak membocorkan informasi Rahasia/Penting kepada pihak manapun baik secara langsung maupun tidak langsung.</td>
          </tr>
          <tr>
            <td style='vertical-align: top; text-align:justify'>2.</td>
            <td style='text-align:justify;'>Tidak memanfaatkan informasi yang saya akses dari Dinas Komunikasi dan Informatika Provinsi Jawa Barat selama penugasan saya untuk kepentingan di luar lingkup pekerjaan yang ditugaskan kepada saya.</td>
          </tr>
          <tr>
            <td style='vertical-align: top; text-align:justify'>3.</td>
            <td style='text-align:justify;'>Melindungi hak kekayaan intelektual Dinas Komunikasi dan Informatika Provinsi Jawa Barat yang saya akses atau ketahui sebagai akibat penugasan saya.</td>
          </tr>
          <tr>
            <td style='vertical-align: top; text-align:justify'>4.</td>
            <td style='text-align:justify;'>Mengamankan seluruh informasi dan sistem informasi sesuai kebijakan yang ditetapkan Dinas Komunikasi dan Informatika Provinsi Jawa Barat.</td>
          </tr>
          <tr>
            <td style='vertical-align: top; text-align:justify'>5.</td>
            <td style='text-align:justify;'>Mematuhi seluruh kebijakan dan prosedur yang ditetapkan Dinas Komunikasi dan Informatika Provinsi Jawa Barat menyangkut keamanan informasi. </td>
          </tr>
          <tr>
            <td style='vertical-align: top; text-align:justify'>6.</td>
            <td style='text-align:justify;'>Mengembalikan seluruh dokumen atau fasilitas sistem informasi Dinas Komunikasi dan Informatika Provinsi Jawa Barat yang dipinjamkan selama penugasan saya, termasuk mengembalikan hak akses baik lojik (User ID) maupun fisik (ID Card) yang saya terima sebagai bagian dari tugas saya.</td>
          </tr>
          <tr>
            <td style='vertical-align: top; text-align:justify'>7.</td>
            <td style='text-align:justify;'>Menerima sanksi sesuai ketentuan kontrak dan/atau hukum yang berlaku apabila saya melakukan pelanggaran terhadap ketentuan yang telah ditetapkan di atas.</td>
          </tr>
          </table>
          <table style='display: flex; font-family: Arial; font-size: 15px; margin-top: 5px;'>
          <tr>
            <td style='width: 50%'>
            <p id="fullDate" style="margin:0;padding:0">
            ${dataPrint[0].date}
            </p>
            <div>
            <img src='${dataPrint[0].sign}' style='max-width:250px;
            max-height:170px;
            width:auto;
            height:auto;'>
            </div>
            <br>
            <p style="margin:0;padding:0">
            ${dataPrint[0].name}
            </p>
            <td style='width: 50%; padding-left: 150px;'><img src='${dataPrint[0].ktp}' style='max-width:290px; max-height:185px; width:auto; height:auto;'></td>
          </tr>
          </table>
        </div>`;
    
    //Write string html to a new-document-window
      myWindow.document.write(sHtml);
    //Finishes writing to a new-document-window
      myWindow.document.close();
    //Sets focus to the current window
    myWindow.focus();
    //Prints the contents of the current window.
    setTimeout(function(){ 
      myWindow.print();
      myWindow.close();
    }, 1500);
    //Closes the current window
      
}
