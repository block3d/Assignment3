// xml data passing
window.onload = function(){
  var form = document.myFormWithdraw;
  form.onsubmit = function loadDoc() {
 if(document.getElementById("withdraw").value > 10000) {
 alert('Maximum withdraw $10000! Retry!');
  } else if (document.getElementById("withdraw").value < 10) {
 alert('Minimum withdraw $10! Retry!');
  } else {
 var message = "<?xml version='1.0'?>"+"<username>"+"<account>"+document.getElementById('account').value+
 "</account>"+"<withdraw>"+document.getElementById("withdraw").value+"</withdraw>"+"</username>";
 var xhttp = new XMLHttpRequest();
 xhttp.open("POST", "/withdraw_success", false);
 xhttp.setRequestHeader('Content-type', 'application/xml');
 xhttp.send(message);
 alert('Attempting to wirthdraw $' + document.getElementById("withdraw").value)
 }
}
}
