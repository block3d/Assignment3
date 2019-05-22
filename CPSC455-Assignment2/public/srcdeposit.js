window.onload = function(){
  var form = document.myFormDep;
  form.onsubmit = function loadDoc() {
 if(document.getElementById("deposit").value > 10000) {
 alert('Maximum deposit $10000! Retry!');
  } else if (document.getElementById("deposit").value < 10) {
 alert('Minimum deposit $10! Retry!');
  } else {
 var message = "<?xml version='1.0'?>"+"<username>"+"<account>"+document.getElementById('account').value+
 "</account>"+"<deposit>"+document.getElementById("deposit").value+"</deposit>"+"</username>";
 var xhttp = new XMLHttpRequest();

 xhttp.onreadystatechange= function() {
 if(xhttp.readyState == 4 && xhttp.status == 200) {
 alert('Attempting to Deposit $' + document.getElementById('deposit').value)}};

 xhttp.open("POST", "/deposit_success", false);
 xhttp.setRequestHeader('Content-type', 'text/xml');
 xhttp.send(message);
}
}
}
