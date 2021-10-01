"use strict";

var urlData = ''
$(function() {
  document.getElementById("waktuKedatangan").value = "";
  document.getElementById("waktuKepulangan").value = "";
  fetch("../env.json")
    .then(response => response.json())
    .then(json => urlData = json[0].local_url);
});

function resetForm() {
  document.getElementById("example-form").reset();
  document.getElementById('image-preview').style.backgroundImage='';
}

const getCookie = (cookie_name) =>{
  // Construct a RegExp object as to include the variable name
  const re = new RegExp(`(?<=${cookie_name}=)[^;]*`);
  try{
    return document.cookie.match(re)[0];	// Will raise TypeError if cookie is not found
  }catch{
    return "this-cookie-doesn't-exist";
  }
}

const exampleForm = document.getElementById("example-form");
exampleForm.addEventListener("submit", function(e){  


  var ttdImgName = '';
  var ktpImgName = '';
  e.preventDefault();

  var signFormData = new FormData();
  var ttdUloadData = document.getElementById('ttd-upload').files[0]
  signFormData.append('file', ttdUloadData, ttdUloadData.name);
  $.ajax({
    async: false,
    url: `${urlData}guest/uploaderTTD`,
    type: 'POST',
    data: signFormData,
    contentType: false,
    cache: false,
    processData: false,
    headers: {
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
      document.getElementById("overlay").removeAttribute("hidden"); 
    },
    success: function (result) {
        // element is div holding the ParticalView
        // console.log(result.data.fileName)
        // document.getElementById("overlay").setAttribute("hidden", false);     
        // iziToast.success({
        //   title: 'Tanda tangan berhasil disimpan',
        //   message: ``,
        //   position: 'topRight'
        // })
        ttdImgName = result.data.fileName
        // console.log(ttdImgName)
    },
    complete: function (responseJSON) {
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
      console.log(xhr)
    }
  }).fail(function (xhr, responseJSON, result, data) {
    // ignore the error and do nothing else
    
    iziToast.error({
      title: 'Gagal menyimpan tanda tangan',
      message: `Unauthorized with error code ${xhr.status}`,
      position: 'topRight'
    })          
    return false;
  });

  var ktpFormData = new FormData();
  var ktpUploaData = document.getElementById('image-upload').files[0]
  ktpFormData.append('file', ktpUploaData, ktpUploaData.name);
  $.ajax({
    async: false,
    url: `${urlData}guest/uploaderKTP`,
    type: 'POST',
    data: ktpFormData,
    contentType: false,
    cache: false,
    processData: false,
    headers: {
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
      document.getElementById("overlay").removeAttribute("hidden"); 
    },
    success: function (result) {
        // element is div holding the ParticalView
        // console.log(result.data.fileName)
        // document.getElementById("overlay").setAttribute("hidden", false);     
        // iziToast.success({
        //   title: 'KTP berhasil disimpan',
        //   message: ``,
        //   position: 'topRight'
        // })
        ktpImgName = result.data.fileName
        // console.log(ktpImgName)
    },
    complete: function (responseJSON) {
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
    }
  }).fail(function (xhr, responseJSON, result, data) {
    // ignore the error and do nothing else
    
    iziToast.error({
      title: 'Gagal menyimpan KTP',
      message: `Unauthorized with error code ${xhr.status}`,
      position: 'topRight'
    })            
    return false;
  });

  var nama = document.getElementById('name').value
  var email = document.getElementById('email').value
  var nik = document.getElementById('nikNumber').value
  var instansi =  document.getElementById('instansi').value
  var phone =  document.getElementById('phoneNumber').value
  var kepKunjungan =  document.getElementById('kepKunjungan').value
  var wKedatangan =  document.getElementById('waktuKedatangan').value
  var wKepulangan =  document.getElementById('waktuKepulangan').value
  //Obj of data to send in future like a dummyDb

  var ktpName = ktpImgName;
  var ttdName  = ttdImgName;

  const data = { 
    name:nama.toUpperCase(),
    email:email,
    nik:String(nik),
    institution:instansi,
    phoneNumber:String(phone).trim(),
    visitReason:kepKunjungan,
    arrivalTime:wKedatangan,
    departureTime:wKepulangan,
    ktpImage:String(ktpImgName), //
    signImage:String(ttdImgName)
  };

  $.ajax({
    async: false,
    url: `${urlData}guest/add`,
    type: 'POST',
    data: JSON.stringify(data),
    datatype: 'json',
    contentType: 'application/json',
    headers: {
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
      document.getElementById("overlay").removeAttribute("hidden"); 
    },
    success: function (result) {
        // element is div holding the ParticalView
        document.getElementById("overlay").setAttribute("hidden", false);     
        iziToast.success({
          title: 'Data Pengunjung Berhasil Ditambahkan',
          message: `Pengunjung Dengan Nama ${result.data.name} Berhasil Disimpan`,
          position: 'topRight'
        })
        setTimeout(() => {
          window.location.replace("index.html")
        }, 3000)
    },
    complete: function (responseJSON) {
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {      
    }
  }).fail(function (xhr, responseJSON, result, data) {
    // ignore the error and do nothing else
    
    iziToast.error({
      title: 'Gagal Menyimpan Data',
      message: `Unauthorized with error code ${xhr.status}`,
      position: 'topRight'
    })        
    setTimeout(() => {
      window.location.replace("nda-form-input.html")
    }, 3000)        
    return false;
  });
});


// section library function


$("select").selectric();
$.uploadPreview({
  input_field: "#image-upload",   // Default: .image-upload
  preview_box: "#image-preview",  // Default: .image-preview
  label_field: "#image-label",    // Default: .image-label
  label_default: "Choose File",   // Default: Choose File
  label_selected: "Change File",  // Default: Change File
  no_label: false,                // Default: false
  success_callback: null          // Default: null
});

$("select").selectric();
$.uploadPreview({
  input_field: "#ttd-upload",   // Default: .image-upload
  preview_box: "#ttd-preview",  // Default: .image-preview
  label_field: "#ttd-label",    // Default: .image-label
  label_default: "Choose File",   // Default: Choose File
  label_selected: "Change File",  // Default: Change File
  no_label: false,                // Default: false
  success_callback: null          // Default: null
});

var cleavePN = new Cleave('.phone-number', {
  phone: true,
  phoneRegionCode: 'id'
});

$('.daterange-cus').daterangepicker({
  locale: {format: 'YYYY-MM-DD'},
  drops: 'down',
  opens: 'right'
});
$('.daterange-btn').daterangepicker({
  ranges: {
    'Today'       : [moment(), moment()],
    'Yesterday'   : [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days' : [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month'  : [moment().startOf('month'), moment().endOf('month')],
    'Last Month'  : [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  },
  startDate: moment().subtract(29, 'days'),
  endDate  : moment()
}, function (start, end) {
  $('.daterange-btn span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'))
});
$(".inputtags").tagsinput('items');

// end of section library function