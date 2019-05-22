const express = require('express');
const sessions = require('client-sessions');
const bodyParser = require("body-parser");
const helmet = require('helmet')

// Assignment 3 new libraries
const https = require("https");
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
// -----------------------------

// Connect to local SQL Server
var mysqlConn=mysql.createConnection({
	host:"localhost",
	user:"appaccount",
	password:"apppass",
	multipleStatements:true
});

// hash salts
const saltRound=10;

require('body-parser-xml')(bodyParser);

"use strict"
var xssFilters = require('xss-filters');
var app = express()
app.use(express.static(__dirname + '/public'));

var fs=require('fs');
var os=require('os');

app.use(bodyParser.xml());

app.use(helmet.contentSecurityPolicy({
	directives:{
		defaultSrc: ["'self'"],
		styleSrc: ["'self'"],
		scriptSrc: ["'self'"]

 },


}));

// cookie
app.use(sessions({
    cookieName: 'session',
    secret: '0x8i3Jl4nw3NgA52B7jF',
    duration: 3*60*1000,
    activeDuration: 3*60*1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
    }));


// displayBankStatement(string user): get user name and outputs html format of bankstatement pulled from mydb.txt
function displayBankStatement(user) {
	var textline = retObj(user);
	var page = "";

	for (var i = 0; i < Object.keys(textline.account.bankacc).length; i++) {
		let acc = "acc" + (i+1);
		page += "Bank account no." + (i+1) + ": $ " + parseInt(textline.account.bankacc[acc]).toFixed(2) + "<br><br>";
	}

	return page;
};

// userExist(user) - returns true(1) if username already exist or false(0) if username does not exist
// NOTE: will check case-insensitive
// NOTE: will process sychronuously
function userExist(user) {
	// read file
	var contents = fs.readFileSync("mydb.txt", "utf8")

	//console.log("Read: ", contents); // print the entire data from mydb.txt
	var array = contents.toString().split("\n");
	var textline = undefined;
	var temp_textline = undefined;
	var temp_user = undefined;
	temp_user = user.toString().toLowerCase();
	var exist = false;
	for (var i = 0; i < array.length-1; i++) {
		textline = JSON.parse(array[i]);
		temp_textline = textline.account.username.toString().toLowerCase();

		//console.log("I am comparing: " + temp_textline + " & " + temp_user);
		if (temp_textline == temp_user) {
			exist = true;
			break;
		}
		textline = JSON.parse(array[i]);
		//console.log("array[" + i + "]: " + array[i]);
		//console.log("textline.account.username: " + textline.account.username);
	}
	return exist;
};
//function to return the data of that username;
function retObj(user) {
	// read file
	var contents = fs.readFileSync("mydb.txt", "utf8")

	//console.log("Read: ", contents); // print the entire data from mydb.txt
	var array = contents.toString().split("\n");
	var textline = undefined;
	var temp_textline = undefined;
	var temp_user = undefined;
	temp_user = user.toString().toLowerCase();
	var exist = false;
	for (var i = 0; i < array.length-1; i++) {
		textline = JSON.parse(array[i]);
		temp_textline = textline.account.username.toString().toLowerCase();

		//console.log("I am comparing: " + temp_textline + " & " + temp_user);
		if (temp_textline == temp_user) {
			exist = true;
			break;
		}

		//console.log("array[" + i + "]: " + array[i]);
		//console.log("textline.account.username: " + textline.account.username);
	}
	return textline;
};



// Get intial response to homepage
app.get('/',function(req,res){
    if(req.session.username)
    {
      res.redirect("/dashboard");
    }
    else
    {
      res.sendFile(__dirname + "/index.html");
    }
  });

// Take user to register page
app.get('/register.html', function(req, res) {
	res.sendFile(__dirname + "/register.html");
});

// Login script when the user inputs user name and password
app.post('/login',function(req,res){
	// get username and password from form
	var user = (req.body.account.username);
	var pass = (req.body.account.password.toString());

	console.log("User Input - user: " + user);
	console.log("User Input - pass: " + pass);
	// Construct the query
	mysqlConn.query('USE users; SELECT username, password from banktable where `username`=?',
	// The ?'s will be replaced with the respective elements from this array
	[user, pass],

	// The call back when the query completes
	function(err, qResult) {
		if (err) throw err;
		console.log(qResult[1]);

		// Does the password match?
		var match = false;

		// Go through the results of the second query
		qResult[1].forEach(function(account) {
			if(account['username'] == user && bcrypt.compareSync(pass,account['password'])) {
			//if (account['username'] == user && account['password'] == pass) {
				console.log("Match!");

				// We have a match!
				match = true;

				//break;
			}
	});

	if (match) {
		req.session.username = user;
		res.redirect('/dashboard');
	} else {
		console.log("Incorrect credentials");
		// if no matches have been found, we are done
		res.send("Wrong");
	}

	// Plaintext implementation
	/*
	var correctPass = undefined;
	var tempobj=undefined;
	// is valid user?
  if (userExist(xssFilters.inHTMLData(user))){
    console.log("We Found a Username!");
    var tempobj=retObj(user);
    correctPass=tempobj.account.password.toString();
  }
	// Check if username matches with input password
	if (correctPass && correctPass === pass) {
		// set the session
    req.session.username=user;
		res.redirect("/dashboard");
	} else {
    res.write("Wrong");
		res.end();
	}
	*/
	});
});



// From register.html - get user input and register account
app.post('/create',function(req,res){
	// If the user does not have a cookie then go back to login page
    	if(!req.session.username) {
		res.redirect("/");
	}

	//console.log("app.post('/create', function(req, res) - req.body: " + req.body);
    	var username = (req.body.account.username); // get username
    	var firstname = (req.body.account.fname); // get first name
    	var lastname = (req.body.account.lname); // get last name
    	var address= (req.body.account.address); // get email address
    	var password=(req.body.account.password); // get password
    	found=false;
			console.log(typeof password)
	// create password hash
	var hash = bcrypt.hashSync(password.toString(),saltRound);

	var match=false;

	mysqlConn.query('USE users; SELECT * from banktable where `username`=?',
	[username],
	// The call back when query completes
	function(err, rows) {
		console.log(rows[1].length);
		if (err) throw err;
		if (!rows[1].length) {
			mysqlConn.query('USE users; INSERT into banktable(username,password,fname,lname,address,bankacc) VALUES (?,?,?,?,?,?)',
			[username,hash,firstname,lastname,address,'0'],

			function(err, qResult) {
				if (err) throw err;
				console.log("User added to database");
			});
		} else
		{
			mysqlConn.end();
			console.log("UserName Already Exists");
		}
	});
	/*
	// check database if unique user id exists
      if(fs.readFileSync("mydb.txt","utf8")!=="")//checks if file is empty
      {
      found = userExist(username);
	    console.log("found: " + found);
      }
  	  if(found===false){
    	let tempobj=req.body;
		  tempobj.account.bankacc={};
      for (i=1;i<=3;i++)
      {
        let acc="acc"+i;
        tempobj.account.bankacc[acc]='0';
      }
    console.log(tempobj);
    var text= JSON.stringify(tempobj);
    fs.open("mydb.txt",'a',function(err,id)
    {
      fs.write(id,text+os.EOL,null,'utf8',function()
      {
        		fs.close(id,function()
              {
          	     console.log('New User Successfully Registered');
          	     res.sendFile(__dirname+"/index.html");
        		   });
      });
     });
  	}
	else{
		// TODO: need to send indicator that the Username already exits
		console.log("Username already exists");
  	}
	*/
    res.end();

});
app.post('/add_success', function(req,res) {
		// do back end processing here
			let tempobj=retObj(req.session.username); //sets temp obj to the user logged in
			console.log(Object.keys(tempobj.account.bankacc).length)
			let acc="acc"+((Object.keys(tempobj.account.bankacc).length)+1)
			newval=0;
			console.log(newval);
			tempobj.account.bankacc[acc]=newval;
			console.log(tempobj);
			//Writes to the database the new line.
			fs.readFile('mydb.txt', 'utf8', function (err,data)
			{
				var formatted = data.replace(JSON.stringify(retObj(req.session.username)),JSON.stringify(tempobj));
				fs.writeFile('mydb.txt', formatted, 'utf8', function (err)
				{
					if (err) return console.log(err);
				});
			});
    	console.log(req.body);
    	console.log("add account Success");
    	res.end()
});
app.use('/add_accounts',function(req,res){
  // res.send('add_accounts')
      if(!req.session.username)
      {
        res.redirect("/");
      }
      var page = "<!DOCTYPE html>"
      page += "<html>"
      // xml data passing
      page += "<body <body bgcolor='#E6E6FA'>"
      page += "<h1>Northside Banking Add Account Page</h1><br><br>"
			page += displayBankStatement(xssFilters.inHTMLData(req.session.username));
      // start form
			page +="<script type='text/javascript' src='./srcaccadd.js'></script>"
      page +="<h2>Click to add an account</h2>"
			page += "<form name='addOne'>"
			// page += "<form action='/deposit_success' method='POST'>"
			// drop down menu
			page += "<label for='account'>Add an account   </label>"
			page += "<select id=account>"
			page += "<option value='acc1'>add One account</option>"
			page += "</select><br><br>"
			page += "<input type='submit' value='Confirm'>"
			page += "</form>"
      // go to main page
      page += "<a href='https://localhost:3000/dashboard'>"
      page += "<button>Main Page</button> </a><br>"
      page += "<a href='https://localhost:3000/logout'>"
      page += "<button>Logout Now!</button></a><br><br>"

      page += "</body></html>"

      res.send(page)

});
app.use('/dashboard', function(req,res) {

    if(!req.session.username)
    {
      res.redirect("/");
    }

    // res.write(Users[0])
    let name = req.session.username
    var page = "<html>"
    page += "<title> NorthSide Dashboard</title>"
    page += "<body <body bgcolor='#E6E6FA'> <h1> Welcome back to NorthSide Banking, " + name + "</h1><br><br>"
    page += displayBankStatement(xssFilters.inHTMLData(name));
    page += "<a href='https://localhost:3000/add_accounts'>"
    page += "<button>Add Accounts!</button> </a><br><br>"
    page += "<a href='https://localhost:3000/deposit'>"
    page += "<button>Deposit Money!</button> </a><br><br>"
    page += "<a href='https://localhost:3000/withdraw'>"
    page += "<button>Withdraw Money!</button> </a><br><br>"
    page += "<a href='https://localhost:3000/transfer'>"
    page += "<button>Transfer Money!</button> </a><br><br>"
    page += "<a href='https://localhost:3000/logout'>"
    page += "<button>Logout Now!</button></a><br><br>"

    page += "</body></html>"

    // add accounts (button)
        // name (user_input_box)
    // withdraw money (button)
        // account_list (drop_down)
        // amount (user_input_box)
    // deposit money
        // account_list (drop_down)
        // amount (user_input_box)
    // transfer money
        // account_list_from (drop_down)
        // account_list_to (drop_down)
        // amount (user_input_box)

    // display accounts
    //
    res.send(page)

});

app.get('/deposit', function(req,res) {
    // res.send('deposit')

    if(!req.session.username)
    {
      res.redirect("/");
    }

    var page = "<!DOCTYPE html>"
    page += "<html>"

    // xml data passing


    page += "<body bgcolor='#E6E6FA'>"
    page += "<h1>Northside Banking Deposit Page</h1><br><br>"
    page += displayBankStatement(xssFilters.inHTMLData(req.session.username));
		page += "<script type='text/javascript' src='./srcdeposit.js'></script>"
    // start form
    page += "<form name='myFormDep'>"
    // page += "<form action='/deposit_success' method='POST'>"

    // drop down menu
    page += "<label for='account'>Choose an account   </label>"
    page += "<select id=account>"
    page += "<option value='acc1'>acc1</option>"
    page += "<option value='acc2'>acc2</option>"
    page += "<option value='acc3'>acc3</option>"
    page += "</select><br><br>"

    // deposit user input
    page += "<label for='deposit'>Deposit between $10 and $10000   </label>"
    page += "<input type='number' id='deposit' name='deposit' value='0' min='10' max='10000' required>"
    page += "<input type='submit' value='Confirm'>"
    page += "</form>"

    // go to main page
    page += "<a href='https://localhost:3000/dashboard'>"
    page += "<button>Main Page</button> </a><br>"
    page += "<a href='https://localhost:3000/logout'>"
    page += "<button>Logout Now!</button></a><br><br>"

    page += "</body></html>"

    res.send(page)

});

app.post('/deposit_success', function(req,res) {
	// gets username
	    	let username =req.session.username;

				//sets username to session username
				let deposit_amount=parseInt(req.body.username.deposit,10);
				//sets the deposit amount
				if (deposit_amount>=0){
	      mysqlConn.query('USE users; SELECT bankacc from banktable where `username` = ?', [username],
				function(err, qResult) {

					let curr_bal=parseFloat((qResult[1][0].bankacc));
					console.log(curr_bal);

					let new_bal=(curr_bal)+deposit_amount;
					console.log(typeof new_bal);
					console.log(new_bal);
					mysqlConn.query('USE users; UPDATE banktable SET `bankacc`= ? WHERE `username` = ?',
					[new_bal,req.session.username],
					function (err, results) {
					if (err) throw err;
					console.log(results);

					});

					if (err) throw err;

				});
			}
			else{
				console.log("Invalid amount");
			}
				res.end();
    });





app.get('/withdraw', function(req,res) {
    // needs to validate database for
    let amountinbank=retObj(req.session.username).account;
    if(!req.session.username)
    {
      res.redirect("/");
    }

    var page = "<html>"

		page+= "<script type='text/javascript' src='./srcwithdraw.js'></script>"

    page += "<body bgcolor='#E6E6FA'>"
    page += "<h1>Northside Banking Withdrawing Page</h1><br><br>"
    page += displayBankStatement(xssFilters.inHTMLData(req.session.username));


    // start form
    page += "<form name='myFormWithdraw'>"

    // drop down menu
    page += "<label for='account'>Choose an account   </label>"
    page += "<select id=account>"
    page += "<option value='acc1'>acc1</option>"
    page += "<option value='acc2'>acc2</option>"
    page += "<option value='acc3'>acc3</option>"
    page += '</select><br><br>'

    // withdraw user input
    page += "<label for='withdraw'>Withdraw between $10 and $10000 at a time  </label>"
    page += "<input type='number' id='withdraw' name='withdraw' value='0' min='10' max='10000' required>"
    page += "<input type='submit' value='Confirm'>"
    page += "</form>"

    // go to main page
    page += "<a href='https://localhost:3000/dashboard'>"
    page += "<button>Main Page</button> </a><br>"
    page += "<a href='https://localhost:3000/logout'>"
    page += "<button>Logout Now!</button></a><br><br>"

    page += "</body></html>"

    res.send(page)
});

app.post('/withdraw_success', function(req,res) {

  // do back end processing here

  let tempobj=retObj(req.session.username); //sets temp obj to the user logged in
  let acc=req.body.username.account.toString(); //sets the users name to acc
  // can make an if statement here to add more accounts
  let valueinacc=parseInt(tempobj.account.bankacc[acc],10);//gets the value of acc
  let withdrawal=parseInt(req.body.username.withdraw,10);//gets value to withdraw
  if(valueinacc>=withdrawal)
  {
  let newval=valueinacc-withdrawal; //new value in account
  console.log(newval);
  tempobj.account.bankacc[acc]=newval;
  console.log(tempobj);

  //Writes to the database the new line.
  fs.readFile('mydb.txt', 'utf8', function (err,data)
  {

    var formatted = data.replace(JSON.stringify(retObj(req.session.username)),JSON.stringify(tempobj));
    fs.writeFile('mydb.txt', formatted, 'utf8', function (err)
    {
      if (err) return console.log(err);
    });
  });


    console.log("withdraw_success")
  }
  else{
    console.log("Withdrawl_fail");
  }

    res.end()

    // do back end processing here
})

app.get('/transfer', function(req,res) {

    if(!req.session.username)
    {
      res.redirect("/");
    }

    var page = "<html>"


    // xml data passing

		page += "<body bgcolor='#E6E6FA'>"
    page += "<h1>Northside Banking Transfer Page</h1><br><br>"
    page += displayBankStatement(xssFilters.inHTMLData(req.session.username));

		page +='<script type="text/javascript" src="./srctransfer.js"></script>'
    // form start
    page += "<form name='myFormTransfer'>"
    page += "<label for='account'>Choose an account to transfer from   </label>"

    // drop down menu account 1
    page += "<select id=sender>"
    page += "<option value='acc1'>acc1</option>"
    page += "<option value='acc2'>acc2</option>"
    page += "<option value='acc3'>acc3</option>"
    page += '</select><br><br>'

    // drop down menu account 2
    page += "<label for='account'>Choose an account to transfer to   </label>"
    page += "<select id=receiver>"
    page += "<option value='acc1'>acc1</option>"
    page += "<option value='acc2'>acc2</option>"
    page += "<option value='acc3'>acc3</option>"
    page += '</select><br><br>'

    // transfer user input
    page += "<label for='transfer'>Transfer between $1 and $10000   </label>"
    page += "<input type='number' id='transfer' value=0 name='transfer' min='1' max='10000' required>"
    page += "<input type='submit' value='Confirm'>"
    page += "</form>"

    // go to main page
    page += "<a href='https://localhost:3000/dashboard'>"
    page += "<button>Main Page</button> </a><br>"
    page += "<a href='https://localhost:3000/logout'>"
    page += "<button>Logout Now!</button></a><br><br>"

    // closing tags
    page += "</body></html>"

    res.send(page)
});

app.post('/transfer_success', function(req,res) {
    console.log(req.body)

    let tempobj=retObj(req.session.username);
    let acc1 =req.body.username.sender.toString();
    let acc2 =req.body.username.receiver.toString();

    // can make an if statement here to add more accounts

    let valueinacc1=parseInt(tempobj.account.bankacc[acc1],10);//gets the value of acc of sender
    let valueinacc2=parseInt(tempobj.account.bankacc[acc2],10);//gets the value of acc of reciever
    let transfer=parseInt(req.body.username.transfer,10);//gets value to transfer
    if(valueinacc1>=transfer)
    {
    let newval=valueinacc1-transfer; //new value in account 1
    let newval2=valueinacc2+transfer;// new value in account 2
    console.log(valueinacc1);
    tempobj.account.bankacc[acc1]=newval;
    tempobj.account.bankacc[acc2]=newval2;
    console.log(valueinacc2);
    }
    //Writes to the database the new line.
    fs.readFile('mydb.txt', 'utf8', function (err,data)
    {

      var formatted = data.replace(JSON.stringify(retObj(req.session.username)),JSON.stringify(tempobj));
      fs.writeFile('mydb.txt', formatted, 'utf8', function (err)
      {
        if (err) return console.log(err);
      });
    });

    console.log("transfer_success")

    res.end()
});


app.get('/logout', function(req, res){

    // Kill the session
    // req.session.reset()
    req.session.destroy();

    res.redirect('/');
});

https.createServer({
    key: fs.readFileSync('./MyKey.key'),  // The private key of the server.
                    // The associated public key is included in the certificate.
                    // Used for securely distributing symmetric keys during connection setup
                    // which in turn are then used for encrypting session data
    cert: fs.readFileSync('./MyCertificate.crt'), // The actual certificate
    passphrase: 'cpsc455'       // The passphrase used for protecting the private key
}, app)
.listen(3000);

app.listen(3000);
