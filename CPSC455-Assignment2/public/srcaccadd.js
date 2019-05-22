window.onload = function(){
  var button = document.addOne;


button.onsubmit=function loadDoc() {
var message = "<?xml version='1.0'?>"+"<username>"+"<bankacc>"+'one'+
"</bankacc>"+"<money>"+'zero'+"</money>"+"</username>";
var xhttp = new XMLHttpRequest();

xhttp.onreadystatechange= function() {
if(xhttp.readyState == 4 && xhttp.status == 200) {
alert('Added one Bank account');}};

xhttp.open("POST", "/add_success", false);
xhttp.setRequestHeader('Content-type', 'text/xml');
xhttp.send(message);
}
};
