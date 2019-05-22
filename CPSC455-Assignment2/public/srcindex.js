window.onload = function(){
  var form = document.myForm;
  form.onsubmit = function loadDoc() {
    var message= "<?xml version='1.0'?>"+"<account>"+"<username>"+document.getElementById('username').value+
    "</username>"+"<password>"+document.getElementById("password").value+"</password>"+"</account>";
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/login", false);
    xhttp.setRequestHeader("Content-type", "text/xml");
    xhttp.send(message);

  };
};
