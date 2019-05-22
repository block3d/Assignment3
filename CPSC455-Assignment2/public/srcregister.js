window.onload = function(){
  var form = document.myFormReg;
  form.onsubmit = function loadDoc() {
    var message= "<?xml version='1.0'?>"+"<account>"+
    "<username>"+document.getElementById('username').value+"</username>"+
    "<password>"+document.getElementById("password").value+"</password>"+
    "<fname>"+document.getElementById("fname").value+"</fname>"+
    "<lname>"+document.getElementById("lname").value+"</lname>"+
    "<email>"+document.getElementById("email").value+"</email>"+"</account>";
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/create", false);
    xhttp.setRequestHeader("Content-type", "text/xml");
    xhttp.send(message);

  }
};
