window.onload = function()
{
    var form = document.myFormTransfer;
    form.onsubmit = function loadDoc()
    {
      var message = "<?xml version='1.0'?>"+"<username>"+
      "<sender>"+document.getElementById('sender').value+"</sender>"+
      "<receiver>"+document.getElementById("receiver").value+"</receiver>"+
      "<transfer>"+document.getElementById('transfer').value+ "</transfer>"+
      "</username>";
      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", "/transfer_success", false);
      xhttp.setRequestHeader('Content-type', 'application/xml');
      xhttp.send(message);
      alert('Attempting to transfer $' + document.getElementById("transfer").value + ' from ' + document.getElementById("sender").value +
      ' to ' + document.getElementById("receiver").value)
    }
  };
