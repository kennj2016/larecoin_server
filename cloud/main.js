require("../cloud/exchange/exchange.js");
require("../cloud/news/news.js");
var AmazonS3 = require('../node_modules/aws-sdk');
var crypto = require('crypto');
const ENCRYPTION_KEY = "XeLcmDnjFufaNLNBuYD7PfwQwmmeT5PE"; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16
var ip = require('ip');
var iplocation = require('iplocation')
var geoip = require('geoip-lite');



var Pusher = require('pusher');

var pusher = new Pusher({
	appId: '559936',
	key: 'a427ec34585f9086204c',
	secret: 'ce659da4b600b3d38652',
	cluster: 'us2',
	encrypted: true
});





AmazonS3.config.update({
    accessKeyId: "AKIAIXOSOWERN7J62PUA",
    secretAccessKey: "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",
    region:'us-east-1'
});
var AmazonSES = require('../node_modules/amazon-ses-mailer');
var ses = new AmazonSES('AKIAIXOSOWERN7J62PUA', 'yi4O3Nf3YslNjBSngX7ytTNa4w+2qnDL+5e39qYR', 'us-east-1');

var s3 = new AmazonS3.S3();
var sns = new AmazonS3.SNS();

var date = new Date();
var month = date.getMonth()+1;
var year = date.getFullYear();	
var XMLHttpRequest = require("../node_modules/xmlhttprequest").XMLHttpRequest;
const startUrl = "https://larecoin.com/#/";



//Before a user is created, phone verified is set to false
Parse.Cloud.beforeSave(Parse.User, function(request, response) {
    if (request.object.isNew()) {
	     request.object.set("phoneVerified", true);
	     request.object.set("eVerified", true);
	     request.object.set("tampered", true);
	     request.object.set("accountVerified", false);
	     request.object.set("firstTimeLoggedIn", true);
	     request.object.set("evSent", true);
	     request.object.set("totalLare", "17.82295");
	     request.object.set("accountVerifiedStatus", "Not Completed");
	     request.object.set("type", "User");
		var config = Parse.Object.extend("config");
		var query = new Parse.Query(config);
		query.get("k7t0S4tWWZ", {
		  success: function(ob) {
		   	var data = ob.get('totalLare');
		   	var newData = parseFloat(data) + 17.82295;
		   	obj.set('totalLare',newData.toString());
		   	obj.save();
		   	response.success('done');
		  },
		  error: function(object, error) {
		  	response.error(error);
		  }
		});
    }
    response.success();
});

Parse.Cloud.beforeSave("Followers", function(request, response) {

	var entry = request.object;

	var queryFollowers = new Parse.Query("Followers");

	queryFollowers.equalTo('following',{
		"__type":"Pointer",
		"objectId":entry.get('following').id,
		"className":"_User"
	});
	queryFollowers.equalTo('follower',{
		"__type":"Pointer",
		"objectId":entry.get('follower').id,
		"className":"_User"
	});

	queryFollowers.first({
		success: function(temp) {
			if(typeof temp != 'undefined' && request.object.isNew() ){
				return response.error({errorCode:123,errorMsg:"Followers already exist!"});
			}
			response.success();
		},
		error: function(error) {
			response.success();
		}
	});
});

//verifyEmailSignup
var pushNotification = function (channel,event,message) {
	pusher.trigger(channel, event, {
		"message": message,
		data:{from:112}
	});
}

var saveNotification = function (from, receiver,message,type,link) {
	return new Promise(function(resolve,reject){

		var Notification = Parse.Object.extend("Notification");
		var NotificationQ = new Notification();
		NotificationQ.set('type',type);

		NotificationQ.set("from", {
			"__type":"Pointer",
			"className":"_User",
			"objectId":from
		});

		NotificationQ.set("receiver", {
			"__type":"Pointer",
			"className":"_User",
			"objectId":receiver
		});

		NotificationQ.set('message',message);
		NotificationQ.set('link',link);
		NotificationQ.set('read',false);
		NotificationQ.save(null, {
			success: function() {
				console.log('1');
				return resolve(true)
			}, error:function(obj,err){
				console.log(obj);

				console.log('e');
				console.log('err',err);
				return reject(err)
			}
		});
	})
}

Parse.Cloud.define('pushNotification', function(request, response) {

	var type = request.params.type;
	var channel = request.params.channel;
	var message = request.params.message;
	var event 	= request.params.event;
	var from 	= request.params.from;
	var receiver 	= request.params.receiver;
	var link 	= request.params.link || null;

	pushNotification(channel,event,message)

	saveNotification(from,receiver,message,type,link).then(function () {
		console.log('hehe');
		response.success('push and save notification successfully');
	}).catch(function (err) {
		response.error(err);
	})


});




Parse.Cloud.define('lowercaseEmails', function(request, response) {
	var _User = Parse.Object.extend("_User");
	var query = new Parse.Query(_User);
	query.limit(request.params.limit);
	query.skip(request.params.page * request.params.limit);
	query.select('objectId','email','username');
	query.find({
	  success: function(results) {
	  	results.map(function(ob,i) {
	  		console.log(ob.get('username') + '..found. '+i+'..' + ob.id);
			var query2 = new Parse.Query(_User);
			query2.get(ob.id, {
			  success: function(data) {
			  	data.set('email',ob.get('username').toLowerCase());
			  	data.set('username',ob.get('username').toLowerCase());
				data.save(null,{useMasterKey:true}, {
				  success: function(gameScore) {
				  	console.log('saved')
				  	console.log(ob.get('username') + '..changed...' + ob.id);
				  }, error:function(err){
				  	console.log(ob.id + "....."+ error.message);
				  }
				});
			  },
			  error: function(object, error) {
			    console.log("Error: " + error.code + " " + error.message);
			  }
			});
	  	});
	  },
	  error: function(error) {
	    console.log("Error: " + error.code + " " + error.message);
	  }
	});
});


//runReferralCode
Parse.Cloud.define('runReferralCode', function(request, response) {
	var _User = Parse.Object.extend("_User");
	var query = new Parse.Query(_User);
	query.equalTo("refURL", undefined);
	query.limit(parseInt(request.params.limit));
	query.find({
	  success: function(results) {
	    for (var i = 0; i < results.length; i++) {
	    	var object = results[i];
	    	var objectId = encrypt(object.id);
	    	object.set('refURL',startUrl + "register/"+objectId);
			object.save(null,{useMasterKey:true}, {
			  success: function(gameScore) {
			  	console.log('saved')
			  	response.success('done');
			  }, error:function(err){
			  	response.error(err)
			  }
			});
	    }
	  },
	  error: function(error) {
	    response.error("Error: " + error.code + " " + error.message);
	  }
	});

});











//verifyEmailSignup
Parse.Cloud.define('verifyEmailSignup', function(request, response) {
    var email = request.params.email;
    var objectId = encrypt(request.params.objectId);
     var refferedEncrpytedUserKey = request.params.referred;
     if (refferedEncrpytedUserKey != undefined) {

     	var userkeyr = decrypt(refferedEncrpytedUserKey);
		var UserCheck = Parse.Object.extend("_User");
		var query = new Parse.Query(UserCheck);
		query.get(userkeyr, {
		  success: function(data) {
			var userPointer1 = {
			  "__type": 'Pointer',
			  "className": '_User',
			  "objectId": request.params.objectId
			}
			var userPointer2 = {
			  "__type": 'Pointer',
			  "className": '_User',
			  "objectId": userkeyr
			}
			var Referrals = Parse.Object.extend("Referrals");
			var refer = new Referrals();
			refer.set("emailAddress", email);
			refer.set("userReferred", userPointer1);
			refer.set("referee", userPointer2);
			refer.set("active", true);
			refer.set("rewardPercent", "10");
			refer.set("totalRewarded", "0");
			refer.save(null, {
			  success: function(gameScore) {
			  	response.success('done');




			  },
			  error: function(gameScore, error) {
			  	response.error(error); 
			}
			});
		  },
		  error: function(object, error) { 
		  	response.error(error); 
		  }
		});




     }
	var GameScore = Parse.Object.extend("_User");
	var query = new Parse.Query(GameScore);
	query.equalTo("objectId",request.params.objectId);
	query.first({
	  success: function(data) {
			data.set("refURL", startUrl + "register/"+objectId);
			data.save(null,{useMasterKey:true}, {
			  success: function(gameScore) {
			  	response.success('done'); 
			  }, error:function(err){
			  	response.error(err)
			  }
			});
	  },
	  error: function(error) {
	   response.error(error)
	  }
	});
    var t = request.params.t;
	var newPersonEmail2 =  newPersonEmail.replace(/{{email}}/g,email); 
	var newPersonEmail3 =  newPersonEmail2.replace(/{{ENCRYPTEDURL}}/g,  startUrl + "verifyemailtophone/" + t + "/" + objectId); 
	var newPersonEmail4 =  newPersonEmail3.replace(/{{FIRSTNAME}}/g, request.params.fname); 
	ses.send({
	from: "Larecoin <support@larecoin.com>",
	  to: [email],
	  replyTo: ["support@larecoin.com"],
	  subject: "Verify your Lare Account",
	  body: {
	      text: 'Sent by https://www.larecoin.com',
	      html: newPersonEmail4
	  }
	},function(err,data){
		if (err) {
			response.error(err);
		} else {
			response.success(data);
		}
	});


	trackEmail('application','emailSend');
	response.success();
});




//phoneVerifiedRelogin
Parse.Cloud.define('phoneVerifiedRelogin', function(request, response) {
	 var objectId = encrypt(request.params.id);
	 response.success(objectId);
});

//sendToUser
Parse.Cloud.define('sendToUser', function(request, response) {
	var sendFrom = request.params.sendFrom;
	var sendTo = request.params.sendTo;
	var amount = request.params.amount;
	var userEmail = request.params.userEmail;
	var UserTransfer = Parse.Object.extend("UserTransfer");
	var transfer = new UserTransfer();
	transfer.set("SendFrom", {
		"__type":"Pointer",
		"className":"_User",
		"objectId":sendFrom
	});
	transfer.set("SendTo", {
		"__type":"Pointer",
		"className":"_User",
		"objectId":sendTo
	});
	transfer.set("amount", amount);
	transfer.set("verified", false);
	transfer.save(null, {
	  success: function(gameScore) {
	  	var urlFinal = startUrl + "verifyuserSend/" + encrypt(gameScore.id);
		var sendtoUser2 =  sendtoUser.replace(/{{email}}/g,userEmail); 
		var sendtoUser3 =  sendtoUser2.replace(/{{firstname}}/g,request.params.fname); 
		var sendtoUser4 =  sendtoUser3.replace(/{{AMOUNT}}/g,amount); 
		var sendtoUser5 =  sendtoUser4.replace(/{{SENDTO}}/g,request.params.userSendTo); 
		var sendtoUser6 =  sendtoUser5.replace(/{{CONFIRMURL}}/g,urlFinal); 
		trackEmail('application','emailSend');
		ses.send({
		from: "Larecoin <support@larecoin.com>",
		  to: [userEmail],
		  replyTo: ["support@larecoin.com"],
		  subject: "Confirm User Transfer",
		  body: {
		      text: 'Sent by https://www.larecoin.com',
		      html: sendtoUser6
		  }
		},function(err,data){
		if (err) {
			response.error(err);
		} else {
			response.success(data);
		}
	});
		trackEmail('application','emailSend');
	  	response.success(gameScore);
	  },
	  error: function(gameScore, error) {
	  	response.error(gameScore);
	  }
	});
});
	

//submitSupportTicket
Parse.Cloud.define('submitSupportTicket', function(request, response) {
	var userEmail = request.params.userEmail;
	var name = request.params.name;

	var Support = Parse.Object.extend("Support");
	var ticket = new Support();
	ticket.set("message", request.params.message);
	ticket.set("user", {
		"__type":"Pointer",
		"className":"_User",
		"objectId": request.params.userId
	});
	ticket.set("resolution", "");
	ticket.set("solved", false);
	ticket.save(null, {
	  success: function(object) {
	   	var objectId = object.id;
	   
		var supportSuccess1 =  supportSuccess.replace(/{{email}}/g,userEmail); 
		var supportSuccess2 =  supportSuccess1.replace(/{{SUPPORTMESSAGE}}/g,request.params.message); 
		var supportSuccess3 =  supportSuccess2.replace(/{{CASENUMBER}}/g,objectId); 
		ses.send({
		from: "Larecoin <support@larecoin.com>",
		  to: [userEmail],
		  replyTo: ["support@larecoin.com"],
		  subject: "Support Request #" + objectId.toLowerCase(),
		  body: {
		      text: 'Sent by https://www.larecoin.com',
		      html: supportSuccess3
		  }
		},function(err,data){
		if (err) {
			
		} else {
			
		}
	});
		trackEmail('application','emailSend');
		ses.send({
		from: "Larecoin <support@larecoin.com>",
		  to: ["support@larecoin.com"],
		  replyTo: ["support@larecoin.com"],
		  subject: "Support Request #" + objectId.toLowerCase(),
		  body: {
		      text: 'Sent by https://www.larecoin.com',
		      html: supportSuccess3
		  }
		},function(err,data){
		if (err) {
			
		} else {
		}
	});
		response.success(objectId)
		
	  },
	  error: function(object, error) {
	    response.error(error)
	  }
	});






});


Parse.Cloud.define('submitSupportTicketEmail', function(request, response) {
	var userEmail = request.params.userEmail;
	var resolution = request.params.resolution;
	var caseNumber = request.params.caseNumber;
	var message = request.params.message;

	var resolutionSupport1 =  resolutionSupport.replace(/{{email}}/g,userEmail); 
	var resolutionSupport2 =  resolutionSupport1.replace(/{{RESOLUTION}}/g,resolution); 
	var resolutionSupport3 =  resolutionSupport2.replace(/{{CASENUMBER}}/g,caseNumber); 
	var resolutionSupport4 =  resolutionSupport3.replace(/{{YOURMESSAGE}}/g,message); 
	
	trackEmail('application','emailSend');

	ses.send({
	from: "Larecoin <support@larecoin.com>",
	  to: [userEmail],
	  replyTo: ["support@larecoin.com"],
	  subject: "Your request has been resolved!",
	  body: {
	      text: 'Sent by https://www.larecoin.com',
	      html: resolutionSupport4
	  }
	},function(err,data){
	if (err) {
		response.error(err);
	} else {
		response.success(data);
	}
});

});
















//sendUserConfirm
Parse.Cloud.define('sendUserConfirm', function(request, response) {
	var objectId = decrypt(request.params.id);
	var UserTransfer = Parse.Object.extend("UserTransfer");
	var query = new Parse.Query(UserTransfer);
	query.get(objectId, {
	  success: function(object) {
	  	if (object.get('verified') == false) {
	  		object.set('verified',true);
	  		var sendFrom = object.get('SendFrom').id;
	  		var sendTo = object.get('SendTo').id;
	  		var amount = object.get('amount');
			var _User1 = Parse.Object.extend("_User");
			var _UserQuery1 = new Parse.Query(_User1);
			_UserQuery1.get(sendFrom, {
			  success: function(data) {
			   	var totalLare = parseFloat(data.get('totalLare')) - parseFloat(amount);
			  	data.set('totalLare',totalLare.toString())
				data.save(null,{useMasterKey:true}, {
				  success: function(gameScore) {
				  	response.success('done'); 
				  }, error:function(err){
				  	response.error(err)
				  }
				});
			  },
			  error: function(object, error) {
			  	response.error(error)
			  }
			});
			var _User2 = Parse.Object.extend("_User");
			var _UserQuery2 = new Parse.Query(_User2);
			_UserQuery2.get(sendTo, {
			  success: function(data2) {
			   	var totalLare = parseFloat(data2.get('totalLare')) + parseFloat(amount);
			  	data2.set('totalLare',totalLare.toString())
				data2.save(null,{useMasterKey:true}, {
				  success: function(gameScore) {
				  	response.success('done'); 
				  }, error:function(err){
				  	response.error(err)
				  }
				});
			  },
			  error: function(object, error) {
			  	response.error(error)
			  }
			});
	  		object.save();
	  		response.success('All Done');
	  	} else {
	  		response.error('Invalid Token')
	  	}
	  },
	  error: function(object, error) {
	  	response.error(error)
	  }
	});	 
});





//setEmailVerifiedTrue
Parse.Cloud.define('checkEmailVerified', function(request, response) {
 	
    var decrypted = decrypt(request.params.key);
	var Users = Parse.Object.extend("_User");
	var query = new Parse.Query(Users);
	query.get(decrypted, {
	  success: function(user) {
	  	if (user.get('eVerified') == true) {

		  	if (user.get('phoneVerified') == true) {
		  		response.success('Fully Verified');
		  	} else {
		  		response.success("Good");
		  	}
	  	} else {
		  	user.set("eVerified", true);
	        user.save(null,{useMasterKey:true},{
	          success: function(updated){
	          	response.success('Done');
	        },
	        error: function(error){
	          response.error(error);
	         }
	       });
	       response.success("Good");
	  	}
	  },
	  error: function(object, error) {
	   	response.error('Not a valid user key')
	  }
	});
});


//checkVerified
Parse.Cloud.define('checkVerified', function(request, response) {
 	
	var Users = Parse.Object.extend("_User");
	var query = new Parse.Query(Users);
	query.get(request.params.id, {
	  success: function(user) {
	  	response.success(user);
	  },
	  error: function(object, error) {
	   	response.error('Not a valid user key')
	  }
	});
});



//loginUserAttempt
Parse.Cloud.define('loginUserAttempt', function(request, response) {
 	
 	// var geo = geoip.lookup(ip);
 	// console.log(geo)
 	
	var GameScore = Parse.Object.extend("FSession");
	var gameScore = new GameScore();
	gameScore.set("user", {
		"__type":"Pointer",
		"className":"_User",
		"objectId":request.params.id
	});
	gameScore.set("date", request.params.date);
	if (request.params.types == true) {
		gameScore.set("type", "Mobile");
	} else {
		gameScore.set("type", "Desktop");
	}
	gameScore.set("date", request.params.date);
	gameScore.set("ipAddress", ip.address());
	gameScore.set("description", request.params.description);
	gameScore.set("Browser", request.headers['user-agent']);
	gameScore.set("Country", "");
	gameScore.save(null, {
	  success: function(gameScore) {
		var newLoginedEmail2 =  newLoginedEmail.replace(/{{email}}/g,request.params.email); 
		var newLoginedEmail3 =  newLoginedEmail2.replace(/{{CURRENTDATE}}/g,  request.params.date); 
		var newLoginedEmail4 =  newLoginedEmail3.replace(/{{IP ADDRESS}}/g,  ip.address()); 
		var newLoginedEmail5 =  newLoginedEmail4.replace(/{{BROWSER}}/g, request.headers['user-agent']); 
		trackEmail('application','emailSend');
		ses.send({
		from: "Larecoin <support@larecoin.com>",
		  to: [request.params.email],
		  replyTo: ["support@larecoin.com"],
		  subject: "Login Info with Larecoin",
		  body: {
		      text: 'Sent by https://www.larecoin.com',
		      html:  newLoginedEmail5
		  }
		},function(err,data){
			if (err) {
				response.error(err);
			} else {
				
			}
		});

	    response.success(gameScore)
	  },
	  error: function(gameScore, error) {
	    response.error(error.message)
	  }
	});




});

















//checkValidVerification
Parse.Cloud.define('checkValidVerification', function(request, response) {
 	
 	var decrypted = decrypt(request.params.key);

	var Users = Parse.Object.extend("_User");
	var query = new Parse.Query(Users);
	query.get(decrypted, {
	  success: function(user) {
	  	if (user.get('eVerified') == true) {
		  	if (user.get('phoneVerified') == true) {
		  		response.error('fullverified');
		  	} else {
		  		response.success("Good");
		  	}
	  	} else {
		  	response.error('emailNotVerified');
	  	}
	  },
	  error: function(object, error) {
	   	response.error('NotValid')
	  }
	});
});



//sendPhoneNumberCode
Parse.Cloud.define('sendPhoneNumberCode', function(request, response) {
 	var pn = request.params.pn;
 	var code = Math.floor(100000 + Math.random() * 900000);
	
    var decrypted = decrypt(request.params.key);
	var Users = Parse.Object.extend("_User");
	var query = new Parse.Query(Users);
	query.get(decrypted, {
	  success: function(user) {
	  	trackEmail('application','phoneSend');
		var params = {
		  Message: 'Hello from Lare. The code is '+code + '.',
		  MessageStructure: 'string',
		  PhoneNumber: pn
		};
		sns.publish(params, function(err, data) {
		  if (err) {
		  	console.log(err.message);
		  	response.error(err);
		  } else {
		  	console.log('works');
			user.set("phone", pn);
		  	user.set("code", code.toString());
	        user.save(null,{useMasterKey:true},{
	          success: function(updated) {
	          	response.success('done');
	          	console.log('works');
	        },
	        error: function(error) {
	          response.error(error);
	         }
	       });
	        response.success('done');
	        console.log('works1');
		  }  
		});	
	  },
	  error: function(object, error) {
	   	response.error('Not a valid user key')
	  }
	});	
});


Parse.Cloud.define('sendAdditionalPhoneCode', function(request, response) {
 	var pn = request.params.pn;
 	var code = Math.floor(100000 + Math.random() * 900000);
	
	var params = {
	  Message: 'Hello from Lare. The code is '+code + '.',
	  MessageStructure: 'string',
	  PhoneNumber: pn
	};
	sns.publish(params, function(err, data) {
	  if (err) {
	  	response.error(err);
	  } else {
        response.success(code);
	  }  
	});	


});


Parse.Cloud.define('sendPhoneCodeDash', function(request, response) {
 	var pn = request.params.pn;
 	var code = Math.floor(100000 + Math.random() * 900000);
	

	var params = {
	  Message: 'Hello from Lare. The code is '+code + '.',
	  MessageStructure: 'string',
	  PhoneNumber: pn
	};
		trackEmail('application','phoneSend');
	sns.publish(params, function(err, data) {
	  if (err) {
	  	console.log(err.message);
	  	response.error(err);
	  } else {
        response.success({"code":code});
	  }  
	});	
	
});





//verifyPhoneNumberCode
Parse.Cloud.define('verifyPhoneNumberCode', function(request, response) {
	
    var decrypted = decrypt(request.params.key);
	var Users = Parse.Object.extend("_User");
	var query = new Parse.Query(Users);
	query.get(decrypted, {
	  success: function(user) {
	  	var code = user.get('code');
	  	if (code == request.params.code) {
			user.set("phoneVerified", true);
	        user.save(null,{useMasterKey:true},{
	          success: function(updated) {
	          response.success('done'); 
	          },
	        error: function(error) {
	          response.error(error);
	         }
	       });

			iplocation(ip.address(), function (error, res) {
				var confirmedDevices = Parse.Object.extend("confirmedDevices");
				var device = new confirmedDevices();
				device.set("user", {
				  "__type": 'Pointer',
				  "className": '_User',
				  "objectId": decrypted
				});
				device.set("Browser", request.headers['user-agent']);
				device.set("ipAddress", ip.address());
				device.set("Near", res.country);
				device.set('current',true);
				device.save(null, {
				  success: function(object) {
				  	response.success('done'); 
				  },
				  error: function(o, error) {
				    response.error(error)
				  }
				});

			 	response.success('done');
			})
	  	} else {
	  		response.error('Your code is wrong.');
	  	}
	  },
	  error: function(object, error) {
	   	response.error('Not a valid user key')
	  }
	});
});




Parse.Cloud.define('updateUserInfo', function(request, response) {
	
	var GameScore = Parse.Object.extend("_User");
	var query = new Parse.Query(GameScore);
	query.equalTo("objectId",request.params.id);
	query.first({
	  success: function(data) {
			data.set("fname", request.params.fname);
			data.set("lname", request.params.lname);
			data.set("monthDate", request.params.monthDate);
			data.set("dayDate", request.params.dayDate);
			data.set("yearDate", request.params.yearDate);
			data.set("streetAddress", request.params.streetAddress);
			data.set("city", request.params.city);
			data.set("state", request.params.state);
			data.set("postalcode", request.params.postalcode);
			data.save(null,{useMasterKey:true}, {
			  success: function(gameScore) {
				response.success('complete');
			  }, error:function(err){
			  	response.error(err)
			  }
			});
			response.success('complete');
	  },
	  error: function(error) {
	   response.error(error)
	  }
	});
});

Parse.Cloud.define('updateFirstTimeUser', function(request, response) {
	
	var GameScore = Parse.Object.extend("_User");
	var query = new Parse.Query(GameScore);
	query.equalTo("objectId",request.params.id);
	query.first({
	  success: function(data) {
			data.set("firstTimeLoggedIn", false);
			data.save(null,{useMasterKey:true}, {
			  success: function(gameScore) {
				response.success('complete');
			  }, error:function(err){
			  	response.error(err)
			  }
			});
			response.success('complete');
	  },
	  error: function(error) {
	   response.error(error)
	  }
	});
});

Parse.Cloud.define('getSessionData', function(request, response) {
	
	var GameScore = Parse.Object.extend("_Session");
	var query = new Parse.Query(GameScore);
	query.equalTo("user", request.params.id);
	query.find({useMasterKey:true}, {
	  success: function(results) {
	  	response.success(results);
	  },
	  error: function(error) {
	   response.error(error)
	  }
	});
});






Parse.Cloud.define('sendReferralEmails', function(request, response) {
	var newReferralEmail2 =  newReferralEmail.replace(/{{email}}/g,request.params.email); 
	var newReferralEmail3 =  newReferralEmail2.replace(/{{ENCRYPTEDURL}}/g,  request.params.referralLink); 
	var newReferralEmail4 =  newReferralEmail3.replace(/{{name of referer}}/g,  request.params.fname + " " + request.params.lname); 
	for (var i = 0; i < request.params.emails.length; i++) {
		var emailer = request.params.emails[i];
		
		trackEmail('application','referralSend');
		ses.send({
		from: "Larecoin <support@larecoin.com>",
		  to: [emailer],
		  replyTo: ["support@larecoin.com"],
		  subject: request.params.fname + " referred you to Lare",
		  body: {
		      text: 'Sent by https://www.larecoin.com',
		      html:  newReferralEmail4
		  }
		},function(err,data){
			if (err) {
				response.error(err);
			} else {
				response.success(data);
			}
		});
	}
	response.success('DONE');
});


Parse.Cloud.define('sendComplianceEmails', function(request, response) {
		var emailer = request.params.email;
		var type = request.params.typeofEmail;
		if (type == "Verified") {
			ses.send({
			from: "Larecoin <support@larecoin.com>",
			  to: [emailer],
			  replyTo: ["support@larecoin.com"],
			  subject: "Your Lare account has been verified!",
			  body: {
			      text: 'Sent by https://www.larecoin.com',
			      html:  accountVerified
			  }
			},function(err,data){
				if (err) {
					response.error(err);
				} else {
					response.success(data);
				}
			});	
			response.success('DONE');
		} else if (type == "Not Verified") {
			ses.send({
			from: "Larecoin <support@larecoin.com>",
			  to: [emailer],
			  replyTo: ["support@larecoin.com"],
			  subject: "Your Lare account could not been verified!",
			  body: {
			      text: 'Sent by https://www.larecoin.com',
			      html:  rejectedCompliance
			  }
			},function(err,data){
				if (err) {
					response.error(err);
				} else {
					response.success(data);
				}
			});	
			response.success('DONE');
		} else {
			ses.send({
			from: "Larecoin <support@larecoin.com>",
			  to: [emailer],
			  replyTo: ["support@larecoin.com"],
			  subject: "Your Lare account verification is pending!",
			  body: {
			      text: 'Sent by https://www.larecoin.com',
			      html:  pendingCompliance
			  }
			},function(err,data){
				if (err) {
					response.error(err);
				} else {
					response.success(data);
				}
			});	
			response.success('DONE');
		}
		trackEmail('application','complianceEmails');
});






Parse.Cloud.define('sendReferralEmailsCustom', function(request, response) {
	var type = "",
		message = "";
	if (request.params.message != "") {
		type = "custom";
		message = request.params.message;
	} else {
		type = "regular";
	}
	var _User = Parse.Object.extend("_User");
	var query = new Parse.Query(_User);
	query.find({
	  success: function(results) {
	  	var emails = [];
	  	for (var i = 0; i < results.length; i++) {
	  		var email = results[i].get('email');
	  		emails.push(email);
	  	}
		for (var i = 0; i < request.params.emails.length; i++) {
			var emailer = request.params.emails[i];
			if (emails.indexOf(emailer) > -1) {
				//Send to Existing User
				trackEmail('application','referralSend');
				ses.send({
				from: "Larecoin <support@larecoin.com>",
				  to: [emailer],
				  replyTo: ["support@larecoin.com"],
				  subject: request.params.fname + " referred you to Lare",
				  body: {
				      text: 'Sent by https://www.larecoin.com',
				      html:  newReferralEmail4
				  }
				},function(err,data){
					if (err) {
						response.error(err);
					} else {
						response.success(data);
					}
				});	

			} else {
				//Send to New User
				trackEmail('application','referralSend');
				ses.send({
				from: "Larecoin <support@larecoin.com>",
				  to: [emailer],
				  replyTo: ["support@larecoin.com"],
				  subject: request.params.fname + " referred you to Lare",
				  body: {
				      text: 'Sent by https://www.larecoin.com',
				      html:  newReferralEmail4
				  }
				},function(err,data){
					if (err) {
						response.error(err);
					} else {
						response.success(data);
					}
				});
			}
		}
		response.success('DONE');
	  },
	  error: function(error) {
	   response.error(error)
	  }
	});
});


Parse.Cloud.define('sendPhoneNumberCustomDash', function(request, response) {
	var message = "";
	if (request.params.message != "") {
		message = request.params.message;
	} else {
		message = "Congrats! You were just invited to receive $10 in larecoin as soon as you register to join https://larecoin.com"
	}
	for (var i = 0; i < request.params.phones.length; i++) {
		var phone = request.params.phones[i];
		var params = {
		  Message: message,
		  MessageStructure: 'string',
		  PhoneNumber: phone
		};
		trackEmail('application','phoneSend');
		sns.publish(params, function(err, data) {
		  if (err) {
		  	response.error(err);
		  } else {
	        response.success('done');
		  }  
		});	
	}
});




Parse.Cloud.define('sendReferralEmailsDash', function(request, response) {
	for (var i = 0; i < request.params.emails.length; i++) {
		var emailer = request.params.emails[i];
		var sendDashEmail2 =  sendDashEmail.replace(/{{email}}/g,emailer); 
		
		trackEmail('application','emailSend');
		ses.send({
		from: "Larecoin <support@larecoin.com>",
		  to: [emailer],
		  replyTo: ["support@larecoin.com"],
		  subject: "Register to Larecoin.com and receive $10 in larecoin",
		  body: {
		      text: 'Sent by https://www.larecoin.com',
		      html:  sendDashEmail2
		  }
		},function(err,data){
			if (err) {
				response.error(err);
			} else {
				response.success(data);
			}
		});
	}
	response.success('DONE');
});




Parse.Cloud.define('sendCustomEmailDash', function(request, response) {
	for (var i = 0; i < request.params.emails.length; i++) {
		var emailer = request.params.emails[i];
		var customMess1 = customMess.replace(/{{email}}/g,emailer); 
		var customMess2 = customMess1.replace(/{{custom message}}/g,request.params.message); 
		trackEmail('application','emailSend');
		ses.send({
		from: "Larecoin <support@larecoin.com>",
		  to: [emailer],
		  replyTo: ["support@larecoin.com"],
		  subject: "A message from Larecoin",
		  body: {
		      text: 'Sent by https://www.larecoin.com',
		      html:  customMess2
		  }
		},function(err,data){
			if (err) {
				response.error(err);
			} else {
				response.success(data);
			}
		});
	}
	response.success('DONE');
});




Parse.Cloud.define('sendExchangeComplete', function(request, response) {
      var exchangeSuccess2 =  exchangeSuccess.replace(/{{email}}/g,request.params.email); 
      var exchangeSuccess3 =  exchangeSuccess2.replace(/{{VIEWTRANSACTION}}/g,"https://larecoin.com/#/login"); 
      var exchangeSuccess4 =  exchangeSuccess3.replace(/{{LAREAMOUNT}}/g, request.params.lareAmount); 
      trackEmail('application','emailSend');
      ses.send({
      from: "Larecoin <support@larecoin.com>",
        to: [request.params.email],
        replyTo: ["support@larecoin.com"],
        subject: "Your Transaction is Complete!",
        body: {
            text: 'Sent by https://www.larecoin.com',
            html: exchangeSuccess4
        }
      },function(err,data){
		if (err) {
			response.error(err);
		} else {
			response.success(data);
		}
	});
      response.success('DONE');
});

Parse.Cloud.define('sendExchangeFailed', function(request, response) {
      var exchangeError2 = exchangeError.replace(/{{email}}/g,request.params.email); 
      var exchangeError3 = exchangeError2.replace(/{{VIEWTRANSACTION}}/g,"https://larecoin.com/#/login"); 
      var exchangeError4 = exchangeError3.replace(/{{COIN1}}/g, request.params.currency2); 
      var exchangeError5 = exchangeError4.replace(/{{COIN2}}/g, "LARE"); 
      var exchangeError6 = exchangeError5.replace(/{{DETAILS}}/g, request.params.errorMessage); 
      trackEmail('application','emailSend');
      ses.send({
      from: "Larecoin <support@larecoin.com>",
        to: [request.params.email],
        replyTo: ["support@larecoin.com"],
        subject: "Your Transaction Failed.",
        body: {
            text: 'Sent by https://www.larecoin.com',
            html: exchangeError6
        }
      },function(err,data){
		if (err) {
			response.error(err);
		} else {
			response.success(data);
		}
	});
      response.success('DONE');


});


Parse.Cloud.define('emailTester', function(request, response) {
	trackEmail('application','emailSend');
	ses.send({
	from: "Larecoin <support@larecoin.com>",
	  to: [request.params.email],
	  replyTo: ["support@larecoin.com"],
	  subject: "Welcome to the new Larecoin 2.0",
	  body: {
	      text: 'Sent by https://www.larecoin.com',
	      html:  request.params.html
	  }
	},function(err,data){
		if (err) {
			response.error(err);
		} else {
			response.success(data);
		}
	});
});


Parse.Cloud.define('newPhoneNumnberAddedEmail', function(request, response) {
	trackEmail('application','emailSend');
	
     var newPhoneNumnberAdded2 = newPhoneNumnberAdded.replace(/{{email}}/g,request.params.email); 
     var newPhoneNumnberAdded3 = newPhoneNumnberAdded2.replace(/{{PHONENUMBER}}/g,request.params.phone); 

	ses.send({
	from: "Larecoin <support@larecoin.com>",
	  to: [request.params.email],
	  replyTo: ["support@larecoin.com"],
	  subject: "Thanks for adding your phone number!",
	  body: {
	      text: 'Sent by https://www.larecoin.com',
	      html:  newPhoneNumnberAdded3
	  }
	},function(err,data){
		if (err) {
			response.error(err);
		} else {
			response.success(data);
		}
	});
});










function encrypt(text) {
 let iv = crypto.randomBytes(IV_LENGTH);
 let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
 let encrypted = cipher.update(text);

 encrypted = Buffer.concat([encrypted, cipher.final()]);

 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
 let textParts = text.split(':');
 let iv = new Buffer(textParts.shift(), 'hex');
 let encryptedText = new Buffer(textParts.join(':'), 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}



Parse.Cloud.define('getTrackingCountsAmDash', function(request, response) {
var userid = "application";
var eventType = request.params.eventType;
var date = new Date();
var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
var fDMonth = firstDay.getMonth() + 1;
var fDDay = firstDay.getDate();
if (fDDay < 10) {
	fDDay = "0" + fDDay;
}
if (fDMonth < 10) {
	fDMonth = "0" + fDMonth;
}
var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
var lDMonth = lastDay.getMonth() + 1;
var lDDay = lastDay.getDate();
if (lDDay < 10) {
	lDDay = "0" + lDDay;
}
if (lDMonth < 10) {
	lDMonth = "0" + lDMonth;
}
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    	response.success(this.responseText);
    } else {
    	response.error(JSON.stringify(this));
    }
  };
  xhttp.open("GET", "https://amplitude.com/api/2/events?e=emailSend&start=20170101&end=20191201&m=totals&i=30", false);
  xhttp.setRequestHeader("Authorization", "Basic NmE1OTEwZmVjNjcxMTVhN2MzYmNmYjU1MGMwMWQ1ZWM6NTJlZDQ0M2YzYzI0OGIwNjkzMzFjYjQwMzJkZjJkYmY=");
  xhttp.send();
});





// Parse.Cloud.define('getTrackingCountsAmDash', function(request, response) {
// var userid = "RelA8gH2QR";
// var date = new Date();
// var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
// var fDMonth = firstDay.getMonth() + 1;
// var fDDay = firstDay.getDate();
// if (fDDay < 10) {
// 	fDDay = "0" + fDDay;
// }
// if (fDMonth < 10) {
// 	fDMonth = "0" + fDMonth;
// }
// var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
// var lDMonth = lastDay.getMonth() + 1;
// var lDDay = lastDay.getDate();
// if (lDDay < 10) {
// 	lDDay = "0" + lDDay;
// }
// if (lDMonth < 10) {
// 	lDMonth = "0" + lDMonth;
// }
//   var xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//     	response.success(this.responseText);
//     } else {
//     	response.error(JSON.stringify(this));
//     }
//   };
//   xhttp.open("GET", "https://amplitude.com/api/2/events?e=emailSend&start="+firstDay.getFullYear()+fDMonth+fDDay+"&end="+lastDay.getFullYear()+lDMonth+lDDay+"&m=totals&i=30", false);
//   xhttp.setRequestHeader("Authorization", "Basic NmE1OTEwZmVjNjcxMTVhN2MzYmNmYjU1MGMwMWQ1ZWM6NTJlZDQ0M2YzYzI0OGIwNjkzMzFjYjQwMzJkZjJkYmY=");
//   xhttp.send();
// });









function trackEmail(userid,eventType) {
	console.log('track')

	var date = new Date();
	var month = date.getMonth()+1;

	if (month < 10) {
		var d = date.getMonth()+1;
		month = "0"+ d;
	}
	var day = date.getDate();
	var year = date.getFullYear();
	var time = date.getTime();
	var xhttp = new XMLHttpRequest();
	  xhttp.onreadystatechange = function(a) {
		  if(xhttp.readyState === 4 && xhttp.status === 200) {
		    console.log(xhttp.responseText);

		  }
	  };
	  xhttp.open("GET", "https://api.amplitude.com/httpapi?api_key=6a5910fec67115a7c3bcfb550c01d5ec&event=%5B%7B%22user_id%22%3A%22"+userid+"%22%2C%20%22event_type%22%3A%22"+eventType+"%22%2C%20%22event_properties%22%3A%7B%22Type%22%3A%22"+eventType+"%22%2C%22Date%22%3A%22"+month+"%2F"+day+"%2F"+year+"%22%2C%22Time%22%3A%22"+time+"%22%7D%7D%5D", true);
	  xhttp.send();
}

// function trackEmail(type,userid) {
// var date = new Date();
// var month = date.getMonth()+1;
// var day = date.getDate();
// var year = date.getFullYear();
// var time = date.getTime();
// var xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function() {
//   };
//   xhttp.open("GET", "https://api.amplitude.com/httpapi?api_key=6a5910fec67115a7c3bcfb550c01d5ec&event=%5B%7B%22user_id%22%3A%22"+userid+"%22%2C%20%22event_type%22%3A%22"+userid+"%22%2C%20%22event_properties%22%3A%7B%22Type%22%3A%22"+type+"%22%2C%22Date%22%3A%22"+month+"%2F"+day+"%2F"+year+"%22%2C%22Time%22%3A%22"+time+"%22%7D%7D%5D", true);
//   xhttp.send();
// }




var newReferralRegistered = 
	"<html>"+
	"   <head>"+
	"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
	"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
	"      <base target='_blank'>"+
	"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
	"      <style type='text/css' class='existing-message-styles'>body {"+
	"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
	"         }"+
	"         a:visited {"+
	"         color: #ffffff;"+
	"         }"+
	"         a:hover {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         a:active {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         img {"+
	"         -ms-interpolation-mode: bicubic;"+
	"         }"+
	"         @media screen and (max-width: 600px) {"+
	"         .container {"+
	"         width: 100% !important;"+
	"         }"+
	"         .containerPad-cell {"+
	"         padding: 10px !important;"+
	"         }"+
	"         .dividerModules {"+
	"         height: 10px !important;"+
	"         }"+
	"         .subhed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .cellIconHed {"+
	"         width: 25px !important;"+
	"         }"+
	"         .iconHed {"+
	"         width: 25px !important; height: 25px !important;"+
	"         }"+
	"         .secthed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .two-col {"+
	"         padding-top: 10px !important;"+
	"         }"+
	"         .resto-img {"+
	"         width: 100% !important;"+
	"         }"+
	"         .two-col-cell {"+
	"         padding-top: 0 !important;"+
	"         }"+
	"         .two-col-spccol {"+
	"         width: 10px !important;"+
	"         }"+
	"         .resto-title {"+
	"         font-size: 12px !important; line-height: 15px !important;"+
	"         }"+
	"         .stars-img {"+
	"         width: 70px !important;"+
	"         }"+
	"         .dataCard {"+
	"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
	"         }"+
	"         .dataCell {"+
	"         padding-top: 8px !important; width: 119px !important;"+
	"         }"+
	"         .dataType {"+
	"         font-size: 12px !important;"+
	"         }"+
	"         .crave-title {"+
	"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
	"         }"+
	"         .crave-btn {"+
	"         float: none !important; display: block !important; margin: 0 auto !important;"+
	"         }"+
	"         .banner2col-cell {"+
	"         padding: 0 !important;"+
	"         }"+
	"         .cellStack {"+
	"         display: block !important; width: 100% !important;"+
	"         }"+
	"         .grphcDwnld {"+
	"         width: 240px !important;"+
	"         }"+
	"         }"+
	"         @media screen {"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
	"         }"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
	"         }"+
	"         }"+
	"      </style>"+
	"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
	"   </head>"+
	"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
	"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"      </p>"+
	"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
	"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
	"         </div>"+
	"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI2IDI2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNiAyNiIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4Ij4KICA8cGF0aCBkPSJtLjMsMTRjLTAuMi0wLjItMC4zLTAuNS0wLjMtMC43czAuMS0wLjUgMC4zLTAuN2wxLjQtMS40YzAuNC0wLjQgMS0wLjQgMS40LDBsLjEsLjEgNS41LDUuOWMwLjIsMC4yIDAuNSwwLjIgMC43LDBsMTMuNC0xMy45aDAuMXYtOC44ODE3OGUtMTZjMC40LTAuNCAxLTAuNCAxLjQsMGwxLjQsMS40YzAuNCwwLjQgMC40LDEgMCwxLjRsMCwwLTE2LDE2LjZjLTAuMiwwLjItMC40LDAuMy0wLjcsMC4zLTAuMywwLTAuNS0wLjEtMC43LTAuM2wtNy44LTguNC0uMi0uM3oiIGZpbGw9IiM5MURDNUEiLz4KPC9zdmc+Cg==' width='60' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 30px; line-height: 0;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    {{REFERRALEAMIL}}"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-top: 0'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; font-weight: 900 !important; font-size:13px; line-height: 70px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;text-transform: uppercase;'><br />"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 600 !important; font-size: 25px; line-height: 0;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    Your referral just registered!"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;'>"+
	"                     Once they have bought larecoin, you will be rewarded $10.00 worth of lare. We will also notify you when that happens."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"                <tr>"+
	"                 <td width='44'><a "+
	"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
	"                  </a>"+
	"               </td>"+
	"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'>"+
	"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
	"                     </a>"+
	"                  </td>"+
	"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
	"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"      </center>"+
	"   </body>"+
	"</html>";


var newPhoneNumnberAdded = 
	"<html>"+
	"   <head>"+
	"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
	"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
	"      <base target='_blank'>"+
	"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
	"      <style type='text/css' class='existing-message-styles'>body {"+
	"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
	"         }"+
	"         a:visited {"+
	"         color: #ffffff;"+
	"         }"+
	"         a:hover {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         a:active {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         img {"+
	"         -ms-interpolation-mode: bicubic;"+
	"         }"+
	"         @media screen and (max-width: 600px) {"+
	"         .container {"+
	"         width: 100% !important;"+
	"         }"+
	"         .containerPad-cell {"+
	"         padding: 10px !important;"+
	"         }"+
	"         .dividerModules {"+
	"         height: 10px !important;"+
	"         }"+
	"         .subhed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .cellIconHed {"+
	"         width: 25px !important;"+
	"         }"+
	"         .iconHed {"+
	"         width: 25px !important; height: 25px !important;"+
	"         }"+
	"         .secthed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .two-col {"+
	"         padding-top: 10px !important;"+
	"         }"+
	"         .resto-img {"+
	"         width: 100% !important;"+
	"         }"+
	"         .two-col-cell {"+
	"         padding-top: 0 !important;"+
	"         }"+
	"         .two-col-spccol {"+
	"         width: 10px !important;"+
	"         }"+
	"         .resto-title {"+
	"         font-size: 12px !important; line-height: 15px !important;"+
	"         }"+
	"         .stars-img {"+
	"         width: 70px !important;"+
	"         }"+
	"         .dataCard {"+
	"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
	"         }"+
	"         .dataCell {"+
	"         padding-top: 8px !important; width: 119px !important;"+
	"         }"+
	"         .dataType {"+
	"         font-size: 12px !important;"+
	"         }"+
	"         .crave-title {"+
	"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
	"         }"+
	"         .crave-btn {"+
	"         float: none !important; display: block !important; margin: 0 auto !important;"+
	"         }"+
	"         .banner2col-cell {"+
	"         padding: 0 !important;"+
	"         }"+
	"         .cellStack {"+
	"         display: block !important; width: 100% !important;"+
	"         }"+
	"         .grphcDwnld {"+
	"         width: 240px !important;"+
	"         }"+
	"         }"+
	"         @media screen {"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
	"         }"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
	"         }"+
	"         }"+
	"      </style>"+
	"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
	"   </head>"+
	"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
	"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"      </p>"+
	"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
	"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
	"         </div>"+
	"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI2IDI2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNiAyNiIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4Ij4KICA8cGF0aCBkPSJtLjMsMTRjLTAuMi0wLjItMC4zLTAuNS0wLjMtMC43czAuMS0wLjUgMC4zLTAuN2wxLjQtMS40YzAuNC0wLjQgMS0wLjQgMS40LDBsLjEsLjEgNS41LDUuOWMwLjIsMC4yIDAuNSwwLjIgMC43LDBsMTMuNC0xMy45aDAuMXYtOC44ODE3OGUtMTZjMC40LTAuNCAxLTAuNCAxLjQsMGwxLjQsMS40YzAuNCwwLjQgMC40LDEgMCwxLjRsMCwwLTE2LDE2LjZjLTAuMiwwLjItMC40LDAuMy0wLjcsMC4zLTAuMywwLTAuNS0wLjEtMC43LTAuM2wtNy44LTguNC0uMi0uM3oiIGZpbGw9IiM5MURDNUEiLz4KPC9zdmc+Cg==' width='60' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 30px; line-height: 0;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    {{PHONENUMBER}}"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-top: 0'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; font-weight: 900 !important; font-size:13px; line-height: 70px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;text-transform: uppercase;'><br />"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 600 !important; font-size: 25px; line-height: 0;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    Phone Number Verified!"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;'>"+
	"                     Your backup phone number has been added to your account. You can set it as your primary by going into your settings and clicking Set Primary."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"                <tr>"+
	"                 <td width='44'><a "+
	"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
	"                  </a>"+
	"               </td>"+
	"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'>"+
	"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
	"                     </a>"+
	"                  </td>"+
	"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
	"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"      </center>"+
	"   </body>"+
	"</html>";


var newLoginedEmail = 
	"<html>"+
	"   <head>"+
	"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
	"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
	"      <base target='_blank'>"+
	"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
	"      <style type='text/css' class='existing-message-styles'>body {"+
	"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
	"         }"+
	"         a:visited {"+
	"         color: #ffffff;"+
	"         }"+
	"         a:hover {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         a:active {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         img {"+
	"         -ms-interpolation-mode: bicubic;"+
	"         }"+
	"         @media screen and (max-width: 600px) {"+
	"         .container {"+
	"         width: 100% !important;"+
	"         }"+
	"         .containerPad-cell {"+
	"         padding: 10px !important;"+
	"         }"+
	"         .dividerModules {"+
	"         height: 10px !important;"+
	"         }"+
	"         .subhed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .cellIconHed {"+
	"         width: 25px !important;"+
	"         }"+
	"         .iconHed {"+
	"         width: 25px !important; height: 25px !important;"+
	"         }"+
	"         .secthed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .two-col {"+
	"         padding-top: 10px !important;"+
	"         }"+
	"         .resto-img {"+
	"         width: 100% !important;"+
	"         }"+
	"         .two-col-cell {"+
	"         padding-top: 0 !important;"+
	"         }"+
	"         .two-col-spccol {"+
	"         width: 10px !important;"+
	"         }"+
	"         .resto-title {"+
	"         font-size: 12px !important; line-height: 15px !important;"+
	"         }"+
	"         .stars-img {"+
	"         width: 70px !important;"+
	"         }"+
	"         .dataCard {"+
	"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
	"         }"+
	"         .dataCell {"+
	"         padding-top: 8px !important; width: 119px !important;"+
	"         }"+
	"         .dataType {"+
	"         font-size: 12px !important;"+
	"         }"+
	"         .crave-title {"+
	"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
	"         }"+
	"         .crave-btn {"+
	"         float: none !important; display: block !important; margin: 0 auto !important;"+
	"         }"+
	"         .banner2col-cell {"+
	"         padding: 0 !important;"+
	"         }"+
	"         .cellStack {"+
	"         display: block !important; width: 100% !important;"+
	"         }"+
	"         .grphcDwnld {"+
	"         width: 240px !important;"+
	"         }"+
	"         }"+
	"         @media screen {"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
	"         }"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
	"         }"+
	"         }"+
	"      </style>"+
	"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
	"   </head>"+
	"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
	"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"      </p>"+
	"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
	"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
	"         </div>"+
	"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI2IDI2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNiAyNiIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4Ij4KICA8cGF0aCBkPSJtLjMsMTRjLTAuMi0wLjItMC4zLTAuNS0wLjMtMC43czAuMS0wLjUgMC4zLTAuN2wxLjQtMS40YzAuNC0wLjQgMS0wLjQgMS40LDBsLjEsLjEgNS41LDUuOWMwLjIsMC4yIDAuNSwwLjIgMC43LDBsMTMuNC0xMy45aDAuMXYtOC44ODE3OGUtMTZjMC40LTAuNCAxLTAuNCAxLjQsMGwxLjQsMS40YzAuNCwwLjQgMC40LDEgMCwxLjRsMCwwLTE2LDE2LjZjLTAuMiwwLjItMC40LDAuMy0wLjcsMC4zLTAuMywwLTAuNS0wLjEtMC43LTAuM2wtNy44LTguNC0uMi0uM3oiIGZpbGw9IiM5MURDNUEiLz4KPC9zdmc+Cg==' width='60' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 30px; line-height: 55px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    Login Info"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    We just wanted to let you know that you logged in during this time into Larecoin"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 45px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    <b>Date: {{CURRENTDATE}}</b>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    <b>IP Address: {{IP ADDRESS}}</b>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                      <b>Browser: {{BROWSER}}</b>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"                <tr>"+
	"                 <td width='44'><a "+
	"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
	"                  </a>"+
	"               </td>"+
	"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'>"+
	"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
	"                     </a>"+
	"                  </td>"+
	"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
	"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"      </center>"+
	"   </body>"+
	"</html>";


var newPersonEmail = 
"<html>"+
"   <head>"+
"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
"      <base target='_blank'>"+
"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
"      <style type='text/css' class='existing-message-styles'>body {"+
"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
"         }"+
"         a:visited {"+
"         color: #ffffff;"+
"         }"+
"         a:hover {"+
"         color: #ffffff !important;"+
"         }"+
"         a:active {"+
"         color: #ffffff !important;"+
"         }"+
"         img {"+
"         -ms-interpolation-mode: bicubic;"+
"         }"+
"         @media screen and (max-width: 600px) {"+
"         .container {"+
"         width: 100% !important;"+
"         }"+
"         .containerPad-cell {"+
"         padding: 10px !important;"+
"         }"+
"         .dividerModules {"+
"         height: 10px !important;"+
"         }"+
"         .subhed {"+
"         font-size: 16px !important;"+
"         }"+
"         .cellIconHed {"+
"         width: 25px !important;"+
"         }"+
"         .iconHed {"+
"         width: 25px !important; height: 25px !important;"+
"         }"+
"         .secthed {"+
"         font-size: 16px !important;"+
"         }"+
"         .two-col {"+
"         padding-top: 10px !important;"+
"         }"+
"         .resto-img {"+
"         width: 100% !important;"+
"         }"+
"         .two-col-cell {"+
"         padding-top: 0 !important;"+
"         }"+
"         .two-col-spccol {"+
"         width: 10px !important;"+
"         }"+
"         .resto-title {"+
"         font-size: 12px !important; line-height: 15px !important;"+
"         }"+
"         .stars-img {"+
"         width: 70px !important;"+
"         }"+
"         .dataCard {"+
"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
"         }"+
"         .dataCell {"+
"         padding-top: 8px !important; width: 119px !important;"+
"         }"+
"         .dataType {"+
"         font-size: 12px !important;"+
"         }"+
"         .crave-title {"+
"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
"         }"+
"         .crave-btn {"+
"         float: none !important; display: block !important; margin: 0 auto !important;"+
"         }"+
"         .banner2col-cell {"+
"         padding: 0 !important;"+
"         }"+
"         .cellStack {"+
"         display: block !important; width: 100% !important;"+
"         }"+
"         .grphcDwnld {"+
"         width: 240px !important;"+
"         }"+
"         }"+
"         @media screen {"+
"         @font-face {"+
"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
"         }"+
"         @font-face {"+
"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
"         }"+
"         }"+
"      </style>"+
"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
"   </head>"+
"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"      </p>"+
"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
"         </div>"+
"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 700 !important; font-size: 25px; line-height: 55px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                    Hi, {{FIRSTNAME}}!"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-top: 0'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; font-weight: 500 !important; font-size:14px; line-height: 30px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;'>To complete your email verification, please press the button below."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;padding-top: 40px;padding-bottom: 40px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 16px; line-height: 35px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                     <table class='button red' cellpadding='0' cellspacing='0' border='0' align='center'> "+
"                        <tbody>"+
"                          <tr> "+
"                           <td align='center' style='color:rgb(255, 255, 255);font-size:14px;font-weight:bold;background-color:rgb(6, 103, 208);text-align:center;padding:12px 22px;border-radius: 34px;max-width:250px;text-decoration: none !important;'><a class='button-link' href='{{ENCRYPTEDURL}}' style='color:#ffffff;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255, 255, 255);font-size:12px;font-weight:bold;text-align:center;text-decoration:none;font-family:Helvetica, Arial, sans;letter-spacing: 1px;' rel='noreferrer'>Verify Email Address</a>"+
"                           </td>"+
"                          </tr>"+
"                        </tbody>"+
"                     </table>"+
"                   </td>"+
"               </tr>"+
"            </tbody>"+
"        </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-top: 0'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 400px; font-family:Helvetica, Arial, sans-serif; font-weight: 500 !important; font-size:14px; line-height: 30px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;'>If you did not create an account using this address, please ignore this email."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"                <tr>"+
"                 <td width='44'><a "+
"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
"                  </a>"+
"               </td>"+
"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'>"+
"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
"                     </a>"+
"                  </td>"+
"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"      </center>"+
"   </body>"+
"</html>";


var newReferralEmail = 
"<html>"+
"   <head>"+
"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
"      <base target='_blank'>"+
"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
"      <style type='text/css' class='existing-message-styles'>body {"+
"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
"         }"+
"         a:visited {"+
"         color: #ffffff;"+
"         }"+
"         a:hover {"+
"         color: #ffffff !important;"+
"         }"+
"         a:active {"+
"         color: #ffffff !important;"+
"         }"+
"         img {"+
"         -ms-interpolation-mode: bicubic;"+
"         }"+
"         @media screen and (max-width: 600px) {"+
"         .container {"+
"         width: 100% !important;"+
"         }"+
"         .containerPad-cell {"+
"         padding: 10px !important;"+
"         }"+
"         .dividerModules {"+
"         height: 10px !important;"+
"         }"+
"         .subhed {"+
"         font-size: 16px !important;"+
"         }"+
"         .cellIconHed {"+
"         width: 25px !important;"+
"         }"+
"         .iconHed {"+
"         width: 25px !important; height: 25px !important;"+
"         }"+
"         .secthed {"+
"         font-size: 16px !important;"+
"         }"+
"         .two-col {"+
"         padding-top: 10px !important;"+
"         }"+
"         .resto-img {"+
"         width: 100% !important;"+
"         }"+
"         .two-col-cell {"+
"         padding-top: 0 !important;"+
"         }"+
"         .two-col-spccol {"+
"         width: 10px !important;"+
"         }"+
"         .resto-title {"+
"         font-size: 12px !important; line-height: 15px !important;"+
"         }"+
"         .stars-img {"+
"         width: 70px !important;"+
"         }"+
"         .dataCard {"+
"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
"         }"+
"         .dataCell {"+
"         padding-top: 8px !important; width: 119px !important;"+
"         }"+
"         .dataType {"+
"         font-size: 12px !important;"+
"         }"+
"         .crave-title {"+
"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
"         }"+
"         .crave-btn {"+
"         float: none !important; display: block !important; margin: 0 auto !important;"+
"         }"+
"         .banner2col-cell {"+
"         padding: 0 !important;"+
"         }"+
"         .cellStack {"+
"         display: block !important; width: 100% !important;"+
"         }"+
"         .grphcDwnld {"+
"         width: 240px !important;"+
"         }"+
"         }"+
"         @media screen {"+
"         @font-face {"+
"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
"         }"+
"         @font-face {"+
"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
"         }"+
"         }"+
"      </style>"+
"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
"   </head>"+
"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"      </p>"+
"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
"         </div>"+
"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 30px; line-height: 55px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                    You've been invited!"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/emails/speaker.png' width='200' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;background-position: center;background-size: cover;object-fit: cover;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table> "+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-top: 0;padding-top: 40px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 400px; font-family:Helvetica, Arial, sans-serif; font-weight: 500 !important; font-size:14px; line-height: 30px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;'>Your friend {{name of referer}} gave you $10 worth of lare, the first cryptocurrency for scholarships allowing you to apply for scholarships, pay for your tuition and buy cool things. <a href='https://www.larecoin.com' style='color:blue'>Learn More</a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;padding-top: 30px;padding-bottom: 30px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 16px; line-height: 35px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                     <table class='button red' cellpadding='0' cellspacing='0' border='0' align='center'> "+
"                        <tbody>"+
"                          <tr> "+
"                           <td align='center' style='color:rgb(255, 255, 255);font-size:14px;font-weight:bold;background-color:rgb(6, 103, 208);text-align:center;padding:12px 22px;border-radius: 34px;max-width:250px;text-decoration: none !important;'><a class='button-link' href='{{ENCRYPTEDURL}}' style='color:#ffffff;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255, 255, 255);font-size:12px;font-weight:bold;text-align:center;text-decoration:none;font-family:Helvetica, Arial, sans;letter-spacing: 1px;' rel='noreferrer'>Claim your lare</a>"+
"                           </td>"+
"                          </tr>"+
"                        </tbody>"+
"                     </table>"+
"                   </td>"+
"               </tr>"+
"            </tbody>"+
"        </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"                <tr>"+
"                 <td width='44'><a "+
"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
"                  </a>"+
"               </td>"+
"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'>"+
"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
"                     </a>"+
"                  </td>"+
"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"      </center>"+
"   </body>"+
"</html>";



var sendtoUser = 
" <html>"+
"   <head>"+
"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
"      <base target='_blank'>"+
"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
"      <style type='text/css' class='existing-message-styles'>body {"+
"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
"         }"+
"         a:visited {"+
"         color: #ffffff;"+
"         }"+
"         a:hover {"+
"         color: #ffffff !important;"+
"         }"+
"         a:active {"+
"         color: #ffffff !important;"+
"         }"+
"         img {"+
"         -ms-interpolation-mode: bicubic;"+
"         }"+
"         @media screen and (max-width: 600px) {"+
"         .container {"+
"         width: 100% !important;"+
"         }"+
"         .containerPad-cell {"+
"         padding: 10px !important;"+
"         }"+
"         .dividerModules {"+
"         height: 10px !important;"+
"         }"+
"         .subhed {"+
"         font-size: 16px !important;"+
"         }"+
"         .cellIconHed {"+
"         width: 25px !important;"+
"         }"+
"         .iconHed {"+
"         width: 25px !important; height: 25px !important;"+
"         }"+
"         .secthed {"+
"         font-size: 16px !important;"+
"         }"+
"         .two-col {"+
"         padding-top: 10px !important;"+
"         }"+
"         .resto-img {"+
"         width: 100% !important;"+
"         }"+
"         .two-col-cell {"+
"         padding-top: 0 !important;"+
"         }"+
"         .two-col-spccol {"+
"         width: 10px !important;"+
"         }"+
"         .resto-title {"+
"         font-size: 12px !important; line-height: 15px !important;"+
"         }"+
"         .stars-img {"+
"         width: 70px !important;"+
"         }"+
"         .dataCard {"+
"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
"         }"+
"         .dataCell {"+
"         padding-top: 8px !important; width: 119px !important;"+
"         }"+
"         .dataType {"+
"         font-size: 12px !important;"+
"         }"+
"         .crave-title {"+
"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
"         }"+
"         .crave-btn {"+
"         float: none !important; display: block !important; margin: 0 auto !important;"+
"         }"+
"         .banner2col-cell {"+
"         padding: 0 !important;"+
"         }"+
"         .cellStack {"+
"         display: block !important; width: 100% !important;"+
"         }"+
"         .grphcDwnld {"+
"         width: 240px !important;"+
"         }"+
"         }"+
"         @media screen {"+
"         @font-face {"+
"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
"         }"+
"         @font-face {"+
"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
"         }"+
"         }"+
"      </style>"+
"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
"   </head>"+
"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"      </p>"+
"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
"         </div>"+
"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 700 !important; font-size: 25px; line-height: 55px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                    Hi, {{firstname}}!"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-top: 0'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; font-weight: 500 !important; font-size:14px; line-height: 30px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;'>To complete your user to user send of {{AMOUNT}} to {{SENDTO}}, please click the button below and we will send the amount to them."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;padding-top: 40px;padding-bottom: 40px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 16px; line-height: 35px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                     <table class='button red' cellpadding='0' cellspacing='0' border='0' align='center'> "+
"                        <tbody>"+
"                          <tr> "+
"                           <td align='center' style='color:rgb(255, 255, 255);font-size:14px;font-weight:bold;background-color:rgb(6, 103, 208);text-align:center;padding:12px 22px;border-radius: 34px;max-width:250px;text-decoration: none !important;'><a class='button-link' href='{{CONFIRMURL}}' style='color:#ffffff;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255, 255, 255);font-size:12px;font-weight:bold;text-align:center;text-decoration:none;font-family:Helvetica, Arial, sans;letter-spacing: 1px;' rel='noreferrer'>Confirm Transfer</a>"+
"                           </td>"+
"                          </tr>"+
"                        </tbody>"+
"                     </table>"+
"                   </td>"+
"               </tr>"+
"            </tbody>"+
"        </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-top: 0'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 400px; font-family:Helvetica, Arial, sans-serif; font-weight: 500 !important; font-size:14px; line-height: 30px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;'>If you did not send anything to anyone, please ignore this email."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"                <tr>"+
"                 <td width='44'><a "+
"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
"                  </a>"+
"               </td>"+
"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'>"+
"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
"                     </a>"+
"                  </td>"+
"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"      </center>"+
"   </body>"+
"</html>";





var supportSuccess = 
"<html>"+
"   <head>"+
"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
"      <base target='_blank'>"+
"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
"      <style type='text/css' class='existing-message-styles'>body {"+
"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
"         }"+
"         a:visited {"+
"         color: #ffffff;"+
"         }"+
"         a:hover {"+
"         color: #ffffff !important;"+
"         }"+
"         a:active {"+
"         color: #ffffff !important;"+
"         }"+
"         img {"+
"         -ms-interpolation-mode: bicubic;"+
"         }"+
"         @media screen and (max-width: 600px) {"+
"         .container {"+
"         width: 100% !important;"+
"         }"+
"         .containerPad-cell {"+
"         padding: 10px !important;"+
"         }"+
"         .dividerModules {"+
"         height: 10px !important;"+
"         }"+
"         .subhed {"+
"         font-size: 16px !important;"+
"         }"+
"         .cellIconHed {"+
"         width: 25px !important;"+
"         }"+
"         .iconHed {"+
"         width: 25px !important; height: 25px !important;"+
"         }"+
"         .secthed {"+
"         font-size: 16px !important;"+
"         }"+
"         .two-col {"+
"         padding-top: 10px !important;"+
"         }"+
"         .resto-img {"+
"         width: 100% !important;"+
"         }"+
"         .two-col-cell {"+
"         padding-top: 0 !important;"+
"         }"+
"         .two-col-spccol {"+
"         width: 10px !important;"+
"         }"+
"         .resto-title {"+
"         font-size: 12px !important; line-height: 15px !important;"+
"         }"+
"         .stars-img {"+
"         width: 70px !important;"+
"         }"+
"         .dataCard {"+
"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
"         }"+
"         .dataCell {"+
"         padding-top: 8px !important; width: 119px !important;"+
"         }"+
"         .dataType {"+
"         font-size: 12px !important;"+
"         }"+
"         .crave-title {"+
"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
"         }"+
"         .crave-btn {"+
"         float: none !important; display: block !important; margin: 0 auto !important;"+
"         }"+
"         .banner2col-cell {"+
"         padding: 0 !important;"+
"         }"+
"         .cellStack {"+
"         display: block !important; width: 100% !important;"+
"         }"+
"         .grphcDwnld {"+
"         width: 240px !important;"+
"         }"+
"         }"+
"         @media screen {"+
"         @font-face {"+
"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
"         }"+
"         @font-face {"+
"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
"         }"+
"         }"+
"      </style>"+
"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
"   </head>"+
"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"      </p>"+
"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
"         </div>"+
"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI2IDI2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNiAyNiIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4Ij4KICA8cGF0aCBkPSJtLjMsMTRjLTAuMi0wLjItMC4zLTAuNS0wLjMtMC43czAuMS0wLjUgMC4zLTAuN2wxLjQtMS40YzAuNC0wLjQgMS0wLjQgMS40LDBsLjEsLjEgNS41LDUuOWMwLjIsMC4yIDAuNSwwLjIgMC43LDBsMTMuNC0xMy45aDAuMXYtOC44ODE3OGUtMTZjMC40LTAuNCAxLTAuNCAxLjQsMGwxLjQsMS40YzAuNCwwLjQgMC40LDEgMCwxLjRsMCwwLTE2LDE2LjZjLTAuMiwwLjItMC40LDAuMy0wLjcsMC4zLTAuMywwLTAuNS0wLjEtMC43LTAuM2wtNy44LTguNC0uMi0uM3oiIGZpbGw9IiM5MURDNUEiLz4KPC9zdmc+Cg==' width='60' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 30px; line-height: 30px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                    Request Recieved"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;'>"+
"                    We recieved your support message. Please allow 24-48 hours for us to email you back in regards to it."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 45px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                    <b>Case Number: {{CASENUMBER}}</b>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                    <b>Message:</b> {{SUPPORTMESSAGE}}"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"                <tr>"+
"                 <td width='44'><a "+
"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
"                  </a>"+
"               </td>"+
"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'>"+
"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
"                     </a>"+
"                  </td>"+
"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"      </center>"+
"   </body>"+
"</html>";


var customMess = 
"<html>"+
"   <head>"+
"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
"      <base target='_blank'>"+
"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
"      <style type='text/css' class='existing-message-styles'>body {"+
"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
"         }"+
"         a:visited {"+
"         color: #ffffff;"+
"         }"+
"         a:hover {"+
"         color: #ffffff !important;"+
"         }"+
"         a:active {"+
"         color: #ffffff !important;"+
"         }"+
"         img {"+
"         -ms-interpolation-mode: bicubic;"+
"         }"+
"         @media screen and (max-width: 600px) {"+
"         .container {"+
"         width: 100% !important;"+
"         }"+
"         .containerPad-cell {"+
"         padding: 10px !important;"+
"         }"+
"         .dividerModules {"+
"         height: 10px !important;"+
"         }"+
"         .subhed {"+
"         font-size: 16px !important;"+
"         }"+
"         .cellIconHed {"+
"         width: 25px !important;"+
"         }"+
"         .iconHed {"+
"         width: 25px !important; height: 25px !important;"+
"         }"+
"         .secthed {"+
"         font-size: 16px !important;"+
"         }"+
"         .two-col {"+
"         padding-top: 10px !important;"+
"         }"+
"         .resto-img {"+
"         width: 100% !important;"+
"         }"+
"         .two-col-cell {"+
"         padding-top: 0 !important;"+
"         }"+
"         .two-col-spccol {"+
"         width: 10px !important;"+
"         }"+
"         .resto-title {"+
"         font-size: 12px !important; line-height: 15px !important;"+
"         }"+
"         .stars-img {"+
"         width: 70px !important;"+
"         }"+
"         .dataCard {"+
"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
"         }"+
"         .dataCell {"+
"         padding-top: 8px !important; width: 119px !important;"+
"         }"+
"         .dataType {"+
"         font-size: 12px !important;"+
"         }"+
"         .crave-title {"+
"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
"         }"+
"         .crave-btn {"+
"         float: none !important; display: block !important; margin: 0 auto !important;"+
"         }"+
"         .banner2col-cell {"+
"         padding: 0 !important;"+
"         }"+
"         .cellStack {"+
"         display: block !important; width: 100% !important;"+
"         }"+
"         .grphcDwnld {"+
"         width: 240px !important;"+
"         }"+
"         }"+
"         @media screen {"+
"         @font-face {"+
"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
"         }"+
"         @font-face {"+
"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
"         }"+
"         }"+
"      </style>"+
"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
"   </head>"+
"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"      </p>"+
"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
"         </div>"+
"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/emails/messageBubble.png' width='70' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;background-position: center;background-size: cover;object-fit: cover;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table> "+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 30px; line-height: 55px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                   A message from Larecoin"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-top: 0;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 400px; font-family:Helvetica, Arial, sans-serif; font-weight: 500 !important; font-size:14px; line-height: 30px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;'>"+
"                     {{custom message}}"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"                <tr>"+
"                 <td width='44'><a "+
"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
"                  </a>"+
"               </td>"+
"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'>"+
"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
"                     </a>"+
"                  </td>"+
"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"      </center>"+
"   </body>"+
"</html>";





var exchangeSuccess = 
"<html>"+
"   <head>"+
"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
"      <base target='_blank'>"+
"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
"      <style type='text/css' class='existing-message-styles'>body {"+
"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
"         }"+
"         a:visited {"+
"         color: #ffffff;"+
"         }"+
"         a:hover {"+
"         color: #ffffff !important;"+
"         }"+
"         a:active {"+
"         color: #ffffff !important;"+
"         }"+
"         img {"+
"         -ms-interpolation-mode: bicubic;"+
"         }"+
"         @media screen and (max-width: 600px) {"+
"         .container {"+
"         width: 100% !important;"+
"         }"+
"         .containerPad-cell {"+
"         padding: 10px !important;"+
"         }"+
"         .dividerModules {"+
"         height: 10px !important;"+
"         }"+
"         .subhed {"+
"         font-size: 16px !important;"+
"         }"+
"         .cellIconHed {"+
"         width: 25px !important;"+
"         }"+
"         .iconHed {"+
"         width: 25px !important; height: 25px !important;"+
"         }"+
"         .secthed {"+
"         font-size: 16px !important;"+
"         }"+
"         .two-col {"+
"         padding-top: 10px !important;"+
"         }"+
"         .resto-img {"+
"         width: 100% !important;"+
"         }"+
"         .two-col-cell {"+
"         padding-top: 0 !important;"+
"         }"+
"         .two-col-spccol {"+
"         width: 10px !important;"+
"         }"+
"         .resto-title {"+
"         font-size: 12px !important; line-height: 15px !important;"+
"         }"+
"         .stars-img {"+
"         width: 70px !important;"+
"         }"+
"         .dataCard {"+
"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
"         }"+
"         .dataCell {"+
"         padding-top: 8px !important; width: 119px !important;"+
"         }"+
"         .dataType {"+
"         font-size: 12px !important;"+
"         }"+
"         .crave-title {"+
"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
"         }"+
"         .crave-btn {"+
"         float: none !important; display: block !important; margin: 0 auto !important;"+
"         }"+
"         .banner2col-cell {"+
"         padding: 0 !important;"+
"         }"+
"         .cellStack {"+
"         display: block !important; width: 100% !important;"+
"         }"+
"         .grphcDwnld {"+
"         width: 240px !important;"+
"         }"+
"         }"+
"         @media screen {"+
"         @font-face {"+
"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
"         }"+
"         @font-face {"+
"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
"         }"+
"         }"+
"      </style>"+
"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
"   </head>"+
"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"      </p>"+
"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
"         </div>"+
"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI2IDI2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNiAyNiIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4Ij4KICA8cGF0aCBkPSJtLjMsMTRjLTAuMi0wLjItMC4zLTAuNS0wLjMtMC43czAuMS0wLjUgMC4zLTAuN2wxLjQtMS40YzAuNC0wLjQgMS0wLjQgMS40LDBsLjEsLjEgNS41LDUuOWMwLjIsMC4yIDAuNSwwLjIgMC43LDBsMTMuNC0xMy45aDAuMXYtOC44ODE3OGUtMTZjMC40LTAuNCAxLTAuNCAxLjQsMGwxLjQsMS40YzAuNCwwLjQgMC40LDEgMCwxLjRsMCwwLTE2LDE2LjZjLTAuMiwwLjItMC40LDAuMy0wLjcsMC4zLTAuMywwLTAuNS0wLjEtMC43LTAuM2wtNy44LTguNC0uMi0uM3oiIGZpbGw9IiM5MURDNUEiLz4KPC9zdmc+Cg==' width='60' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 30px; line-height: 0;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                    {{LAREAMOUNT}} LARE"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-top: 0'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; font-weight: 900 !important; font-size:13px; line-height: 70px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;text-transform: uppercase;'>Rewarded"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 600 !important; font-size: 25px; line-height: 0;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                    Yay, transaction complete!"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;'>"+
"                     Your transaction was successful! You can view the transaction details by clicking the button below."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 16px; line-height: 35px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                     <table class='button red' cellpadding='0' cellspacing='0' border='0' align='center'> "+
"                        <tbody>"+
"                          <tr> "+
"                           <td align='center' style='color:rgb(255, 255, 255);font-size:14px;font-weight:bold;background-color:rgb(6, 103, 208);text-align:center;padding:12px 22px;border-radius: 34px;max-width:250px;text-decoration: none !important;'><a class='button-link' href='{{VIEWTRANSACTION}}' style='color:#ffffff;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255, 255, 255);font-size:12px;font-weight:bold;text-align:center;text-decoration:none;font-family:Helvetica, Arial, sans;letter-spacing: 1px;' rel='noreferrer'>View Transaction</a>"+
"                           </td>"+
"                          </tr>"+
"                        </tbody>"+
"                     </table>"+
"                   </td>"+
"               </tr>"+
"            </tbody>"+
"        </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"                <tr>"+
"                 <td width='44'><a "+
"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
"                  </a>"+
"               </td>"+
"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'>"+
"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
"                     </a>"+
"                  </td>"+
"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"      </center>"+
"   </body>"+
"</html>";


var exchangeError = 
"<html>"+
"   <head>"+
"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
"      <base target='_blank'>"+
"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
"      <style type='text/css' class='existing-message-styles'>body {"+
"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
"         }"+
"         a:visited {"+
"         color: #ffffff;"+
"         }"+
"         a:hover {"+
"         color: #ffffff !important;"+
"         }"+
"         a:active {"+
"         color: #ffffff !important;"+
"         }"+
"         img {"+
"         -ms-interpolation-mode: bicubic;"+
"         }"+
"         @media screen and (max-width: 600px) {"+
"         .container {"+
"         width: 100% !important;"+
"         }"+
"         .containerPad-cell {"+
"         padding: 10px !important;"+
"         }"+
"         .dividerModules {"+
"         height: 10px !important;"+
"         }"+
"         .subhed {"+
"         font-size: 16px !important;"+
"         }"+
"         .cellIconHed {"+
"         width: 25px !important;"+
"         }"+
"         .iconHed {"+
"         width: 25px !important; height: 25px !important;"+
"         }"+
"         .secthed {"+
"         font-size: 16px !important;"+
"         }"+
"         .two-col {"+
"         padding-top: 10px !important;"+
"         }"+
"         .resto-img {"+
"         width: 100% !important;"+
"         }"+
"         .two-col-cell {"+
"         padding-top: 0 !important;"+
"         }"+
"         .two-col-spccol {"+
"         width: 10px !important;"+
"         }"+
"         .resto-title {"+
"         font-size: 12px !important; line-height: 15px !important;"+
"         }"+
"         .stars-img {"+
"         width: 70px !important;"+
"         }"+
"         .dataCard {"+
"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
"         }"+
"         .dataCell {"+
"         padding-top: 8px !important; width: 119px !important;"+
"         }"+
"         .dataType {"+
"         font-size: 12px !important;"+
"         }"+
"         .crave-title {"+
"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
"         }"+
"         .crave-btn {"+
"         float: none !important; display: block !important; margin: 0 auto !important;"+
"         }"+
"         .banner2col-cell {"+
"         padding: 0 !important;"+
"         }"+
"         .cellStack {"+
"         display: block !important; width: 100% !important;"+
"         }"+
"         .grphcDwnld {"+
"         width: 240px !important;"+
"         }"+
"         }"+
"         @media screen {"+
"         @font-face {"+
"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
"         }"+
"         @font-face {"+
"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
"         }"+
"         }"+
"      </style>"+
"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
"   </head>"+
"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"      </p>"+
"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
"         </div>"+
"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 50px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MDcuMiA1MDcuMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTA3LjIgNTA3LjI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Y2lyY2xlIHN0eWxlPSJmaWxsOiNGMTUyNDk7IiBjeD0iMjUzLjYiIGN5PSIyNTMuNiIgcj0iMjUzLjYiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0FEMEUwRTsiIGQ9Ik0xNDcuMiwzNjhMMjg0LDUwNC44YzExNS4yLTEzLjYsMjA2LjQtMTA0LDIyMC44LTIxOS4yTDM2Ny4yLDE0OEwxNDcuMiwzNjh6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBkPSJNMzczLjYsMzA5LjZjMTEuMiwxMS4yLDExLjIsMzAuNCwwLDQxLjZsLTIyLjQsMjIuNGMtMTEuMiwxMS4yLTMwLjQsMTEuMi00MS42LDBsLTE3Ni0xNzYgIGMtMTEuMi0xMS4yLTExLjItMzAuNCwwLTQxLjZsMjMuMi0yMy4yYzExLjItMTEuMiwzMC40LTExLjIsNDEuNiwwTDM3My42LDMwOS42eiIvPgo8cGF0aCBzdHlsZT0iZmlsbDojRDZENkQ2OyIgZD0iTTI4MC44LDIxNkwyMTYsMjgwLjhsOTMuNiw5Mi44YzExLjIsMTEuMiwzMC40LDExLjIsNDEuNiwwbDIzLjItMjMuMmMxMS4yLTExLjIsMTEuMi0zMC40LDAtNDEuNiAgTDI4MC44LDIxNnoiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zMDkuNiwxMzMuNmMxMS4yLTExLjIsMzAuNC0xMS4yLDQxLjYsMGwyMy4yLDIzLjJjMTEuMiwxMS4yLDExLjIsMzAuNCwwLDQxLjZMMTk3LjYsMzczLjYgIGMtMTEuMiwxMS4yLTMwLjQsMTEuMi00MS42LDBsLTIyLjQtMjIuNGMtMTEuMi0xMS4yLTExLjItMzAuNCwwLTQxLjZMMzA5LjYsMTMzLjZ6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='50' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 5px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 600 !important; font-size: 25px; line-height: 0;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                    Oops, transaction failed!"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 17px; line-height: 45px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;text-transform: uppercase; padding: 20px;'>"+
"                     {{COIN1}} > {{COIN2}} "+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 12px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;'>"+
"                     The error was<br />"+
"                     <b style='color:red;font-size: 20px'>{{DETAILS}}</b>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 16px; line-height: 35px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
"                     <table class='button red' cellpadding='0' cellspacing='0' border='0' align='center'> "+
"                        <tbody>"+
"                          <tr> "+
"                           <td align='center' style='color:rgb(255, 255, 255);font-size:14px;font-weight:bold;background-color:rgb(6, 103, 208);text-align:center;padding:12px 22px;border-radius: 34px;max-width:250px;text-decoration: none !important;'><a class='button-link' href='{{VIEWTRANSACTION}}' style='color:#ffffff;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255, 255, 255);font-size:12px;font-weight:bold;text-align:center;text-decoration:none;font-family:Helvetica, Arial, sans;letter-spacing: 1px;' rel='noreferrer'>View Transaction</a>"+
"                           </td>"+
"                          </tr>"+
"                        </tbody>"+
"                     </table>"+
"                   </td>"+
"               </tr>"+
"            </tbody>"+
"        </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 40px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"                <tr>"+
"                 <td width='44'><a "+
"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
"                  </a>"+
"               </td>"+
"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'>"+
"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
"                     </a>"+
"                  </td>"+
"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
"            </tbody>"+
"         </table>"+
"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
"            <tbody>"+
"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
"                     <img src='https://larecoin.com/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"      </center>"+
"   </body>"+
"</html>";


var accountVerified = 
	"<html>"+
	"   <head>"+
	"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
	"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
	"      <base target='_blank'>"+
	"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
	"      <style type='text/css' class='existing-message-styles'>body {"+
	"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
	"         }"+
	"         a:visited {"+
	"         color: #ffffff;"+
	"         }"+
	"         a:hover {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         a:active {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         img {"+
	"         -ms-interpolation-mode: bicubic;"+
	"         }"+
	"         @media screen and (max-width: 600px) {"+
	"         .container {"+
	"         width: 100% !important;"+
	"         }"+
	"         .containerPad-cell {"+
	"         padding: 10px !important;"+
	"         }"+
	"         .dividerModules {"+
	"         height: 10px !important;"+
	"         }"+
	"         .subhed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .cellIconHed {"+
	"         width: 25px !important;"+
	"         }"+
	"         .iconHed {"+
	"         width: 25px !important; height: 25px !important;"+
	"         }"+
	"         .secthed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .two-col {"+
	"         padding-top: 10px !important;"+
	"         }"+
	"         .resto-img {"+
	"         width: 100% !important;"+
	"         }"+
	"         .two-col-cell {"+
	"         padding-top: 0 !important;"+
	"         }"+
	"         .two-col-spccol {"+
	"         width: 10px !important;"+
	"         }"+
	"         .resto-title {"+
	"         font-size: 12px !important; line-height: 15px !important;"+
	"         }"+
	"         .stars-img {"+
	"         width: 70px !important;"+
	"         }"+
	"         .dataCard {"+
	"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
	"         }"+
	"         .dataCell {"+
	"         padding-top: 8px !important; width: 119px !important;"+
	"         }"+
	"         .dataType {"+
	"         font-size: 12px !important;"+
	"         }"+
	"         .crave-title {"+
	"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
	"         }"+
	"         .crave-btn {"+
	"         float: none !important; display: block !important; margin: 0 auto !important;"+
	"         }"+
	"         .banner2col-cell {"+
	"         padding: 0 !important;"+
	"         }"+
	"         .cellStack {"+
	"         display: block !important; width: 100% !important;"+
	"         }"+
	"         .grphcDwnld {"+
	"         width: 240px !important;"+
	"         }"+
	"         }"+
	"         @media screen {"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
	"         }"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
	"         }"+
	"         }"+
	"      </style>"+
	"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
	"   </head>"+
	"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
	"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"      </p>"+
	"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
	"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
	"         </div>"+
	"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"        "+
	"          <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI2IDI2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNiAyNiIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4Ij4KICA8cGF0aCBkPSJtLjMsMTRjLTAuMi0wLjItMC4zLTAuNS0wLjMtMC43czAuMS0wLjUgMC4zLTAuN2wxLjQtMS40YzAuNC0wLjQgMS0wLjQgMS40LDBsLjEsLjEgNS41LDUuOWMwLjIsMC4yIDAuNSwwLjIgMC43LDBsMTMuNC0xMy45aDAuMXYtOC44ODE3OGUtMTZjMC40LTAuNCAxLTAuNCAxLjQsMGwxLjQsMS40YzAuNCwwLjQgMC40LDEgMCwxLjRsMCwwLTE2LDE2LjZjLTAuMiwwLjItMC40LDAuMy0wLjcsMC4zLTAuMywwLTAuNS0wLjEtMC43LTAuM2wtNy44LTguNC0uMi0uM3oiIGZpbGw9IiM5MURDNUEiLz4KPC9zdmc+Cg==' width='60' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 20px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 600 !important; font-size: 25px; line-height: 35px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    Account Verified!"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;'>"+
	"                     Your identity has been authenticated and your account is now verified. You are now able to send Larecoin to other verified accounts as well as make usd transactions. Stay tuned for platform updates. Have a great day."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 16px; line-height: 35px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                     <table class='button red' cellpadding='0' cellspacing='0' border='0' align='center'> "+
	"                        <tbody>"+
	"                          <tr> "+
	"                           <td align='center' style='color:rgb(255, 255, 255);font-size:14px;font-weight:bold;background-color:rgb(6, 103, 208);text-align:center;padding:12px 22px;border-radius: 34px;max-width:250px;text-decoration: none !important;'><a class='button-link' href='https://www.larecoin.com/#/login' style='color:#ffffff;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255, 255, 255);font-size:12px;font-weight:bold;text-align:center;text-decoration:none;font-family:Helvetica, Arial, sans;letter-spacing: 1px;' rel='noreferrer'>My Account</a>"+
	"                           </td>"+
	"                          </tr>"+
	"                        </tbody>"+
	"                     </table>"+
	"                   </td>"+
	"               </tr>"+
	"            </tbody>"+
	"        </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"                <tr>"+
	"                 <td width='44'><a "+
	"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
	"                  </a>"+
	"               </td>"+
	"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'>"+
	"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
	"                     </a>"+
	"                  </td>"+
	"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
	"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"      </center>"+
	"   </body>"+
	"</html>";



var rejectedCompliance = 
	"<html>"+
	"   <head>"+
	"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
	"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
	"      <base target='_blank'>"+
	"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
	"      <style type='text/css' class='existing-message-styles'>body {"+
	"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
	"         }"+
	"         a:visited {"+
	"         color: #ffffff;"+
	"         }"+
	"         a:hover {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         a:active {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         img {"+
	"         -ms-interpolation-mode: bicubic;"+
	"         }"+
	"         @media screen and (max-width: 600px) {"+
	"         .container {"+
	"         width: 100% !important;"+
	"         }"+
	"         .containerPad-cell {"+
	"         padding: 10px !important;"+
	"         }"+
	"         .dividerModules {"+
	"         height: 10px !important;"+
	"         }"+
	"         .subhed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .cellIconHed {"+
	"         width: 25px !important;"+
	"         }"+
	"         .iconHed {"+
	"         width: 25px !important; height: 25px !important;"+
	"         }"+
	"         .secthed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .two-col {"+
	"         padding-top: 10px !important;"+
	"         }"+
	"         .resto-img {"+
	"         width: 100% !important;"+
	"         }"+
	"         .two-col-cell {"+
	"         padding-top: 0 !important;"+
	"         }"+
	"         .two-col-spccol {"+
	"         width: 10px !important;"+
	"         }"+
	"         .resto-title {"+
	"         font-size: 12px !important; line-height: 15px !important;"+
	"         }"+
	"         .stars-img {"+
	"         width: 70px !important;"+
	"         }"+
	"         .dataCard {"+
	"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
	"         }"+
	"         .dataCell {"+
	"         padding-top: 8px !important; width: 119px !important;"+
	"         }"+
	"         .dataType {"+
	"         font-size: 12px !important;"+
	"         }"+
	"         .crave-title {"+
	"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
	"         }"+
	"         .crave-btn {"+
	"         float: none !important; display: block !important; margin: 0 auto !important;"+
	"         }"+
	"         .banner2col-cell {"+
	"         padding: 0 !important;"+
	"         }"+
	"         .cellStack {"+
	"         display: block !important; width: 100% !important;"+
	"         }"+
	"         .grphcDwnld {"+
	"         width: 240px !important;"+
	"         }"+
	"         }"+
	"         @media screen {"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
	"         }"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
	"         }"+
	"         }"+
	"      </style>"+
	"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
	"   </head>"+
	"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
	"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"      </p>"+
	"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
	"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
	"         </div>"+
	"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"        "+
	"          <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MDcuMiA1MDcuMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTA3LjIgNTA3LjI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Y2lyY2xlIHN0eWxlPSJmaWxsOiNGMTUyNDk7IiBjeD0iMjUzLjYiIGN5PSIyNTMuNiIgcj0iMjUzLjYiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0FEMEUwRTsiIGQ9Ik0xNDcuMiwzNjhMMjg0LDUwNC44YzExNS4yLTEzLjYsMjA2LjQtMTA0LDIyMC44LTIxOS4yTDM2Ny4yLDE0OEwxNDcuMiwzNjh6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBkPSJNMzczLjYsMzA5LjZjMTEuMiwxMS4yLDExLjIsMzAuNCwwLDQxLjZsLTIyLjQsMjIuNGMtMTEuMiwxMS4yLTMwLjQsMTEuMi00MS42LDBsLTE3Ni0xNzYgIGMtMTEuMi0xMS4yLTExLjItMzAuNCwwLTQxLjZsMjMuMi0yMy4yYzExLjItMTEuMiwzMC40LTExLjIsNDEuNiwwTDM3My42LDMwOS42eiIvPgo8cGF0aCBzdHlsZT0iZmlsbDojRDZENkQ2OyIgZD0iTTI4MC44LDIxNkwyMTYsMjgwLjhsOTMuNiw5Mi44YzExLjIsMTEuMiwzMC40LDExLjIsNDEuNiwwbDIzLjItMjMuMmMxMS4yLTExLjIsMTEuMi0zMC40LDAtNDEuNiAgTDI4MC44LDIxNnoiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zMDkuNiwxMzMuNmMxMS4yLTExLjIsMzAuNC0xMS4yLDQxLjYsMGwyMy4yLDIzLjJjMTEuMiwxMS4yLDExLjIsMzAuNCwwLDQxLjZMMTk3LjYsMzczLjYgIGMtMTEuMiwxMS4yLTMwLjQsMTEuMi00MS42LDBsLTIyLjQtMjIuNGMtMTEuMi0xMS4yLTExLjItMzAuNCwwLTQxLjZMMzA5LjYsMTMzLjZ6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='50' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 20px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 600 !important; font-size: 35px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                     Account could not be verified!"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;'>"+
	"                     The verification documents you have submitted weren’t processed because they could not be authenticated. Please follow the instructions below:"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-top: 0;padding-top:20px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 520px; font-family:Helvetica, Arial, sans-serif; font-weight: 500 !important; font-size:14px; line-height: 30px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;'>"+
	"                     <ul>"+
	"                        <li>Write your name and today’s date in big clear print on a blank piece of paper.</li>"+
	"                        <li>Take a photo with your face visible, holding your identification and the piece of paper containing your name and today’s date.</li>"+
	"                        <li>Submit proof of address (this can be a utility bill, a bank statement or proof of insurance)</li>"+
	"                     </ul>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>  "+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;'>"+
	"                     We apologize for the inconvenience, as soon as you submit these documents we will review and try to process your verification request."+
	"                     <br /><br />"+
	"                     If you are still having issues, feel free to contact our support team for further assistance."+
	"                     <br /><br />"+
	"                     Have a great day."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 16px; line-height: 35px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                     <table class='button red' cellpadding='0' cellspacing='0' border='0' align='center'> "+
	"                        <tbody>"+
	"                          <tr> "+
	"                           <td align='center' style='color:rgb(255, 255, 255);font-size:14px;font-weight:bold;background-color:rgb(6, 103, 208);text-align:center;padding:12px 22px;border-radius: 34px;max-width:250px;text-decoration: none !important;'><a class='button-link' href='https://www.larecoin.com/#/login' style='color:#ffffff;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255, 255, 255);font-size:12px;font-weight:bold;text-align:center;text-decoration:none;font-family:Helvetica, Arial, sans;letter-spacing: 1px;' rel='noreferrer'>My Account</a>"+
	"                           </td>"+
	"                          </tr>"+
	"                        </tbody>"+
	"                     </table>"+
	"                   </td>"+
	"               </tr>"+
	"            </tbody>"+
	"        </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"                <tr>"+
	"                 <td width='44'><a "+
	"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
	"                  </a>"+
	"               </td>"+
	"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'>"+
	"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
	"                     </a>"+
	"                  </td>"+
	"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
	"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"      </center>"+
	"   </body>"+
	"</html>";

var pendingCompliance = 
	"<html>"+
	"   <head>"+
	"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
	"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
	"      <base target='_blank'>"+
	"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
	"      <style type='text/css' class='existing-message-styles'>body {"+
	"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
	"         }"+
	"         a:visited {"+
	"         color: #ffffff;"+
	"         }"+
	"         a:hover {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         a:active {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         img {"+
	"         -ms-interpolation-mode: bicubic;"+
	"         }"+
	"         @media screen and (max-width: 600px) {"+
	"         .container {"+
	"         width: 100% !important;"+
	"         }"+
	"         .containerPad-cell {"+
	"         padding: 10px !important;"+
	"         }"+
	"         .dividerModules {"+
	"         height: 10px !important;"+
	"         }"+
	"         .subhed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .cellIconHed {"+
	"         width: 25px !important;"+
	"         }"+
	"         .iconHed {"+
	"         width: 25px !important; height: 25px !important;"+
	"         }"+
	"         .secthed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .two-col {"+
	"         padding-top: 10px !important;"+
	"         }"+
	"         .resto-img {"+
	"         width: 100% !important;"+
	"         }"+
	"         .two-col-cell {"+
	"         padding-top: 0 !important;"+
	"         }"+
	"         .two-col-spccol {"+
	"         width: 10px !important;"+
	"         }"+
	"         .resto-title {"+
	"         font-size: 12px !important; line-height: 15px !important;"+
	"         }"+
	"         .stars-img {"+
	"         width: 70px !important;"+
	"         }"+
	"         .dataCard {"+
	"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
	"         }"+
	"         .dataCell {"+
	"         padding-top: 8px !important; width: 119px !important;"+
	"         }"+
	"         .dataType {"+
	"         font-size: 12px !important;"+
	"         }"+
	"         .crave-title {"+
	"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
	"         }"+
	"         .crave-btn {"+
	"         float: none !important; display: block !important; margin: 0 auto !important;"+
	"         }"+
	"         .banner2col-cell {"+
	"         padding: 0 !important;"+
	"         }"+
	"         .cellStack {"+
	"         display: block !important; width: 100% !important;"+
	"         }"+
	"         .grphcDwnld {"+
	"         width: 240px !important;"+
	"         }"+
	"         }"+
	"         @media screen {"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
	"         }"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
	"         }"+
	"         }"+
	"      </style>"+
	"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
	"   </head>"+
	"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
	"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"      </p>"+
	"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
	"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
	"         </div>"+
	"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"        "+
	"          <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAaYSURBVHhe7Z1ZbFRVHMYLJoryoHGJPhj1wRjFBzUmPhgxEqPRgILBqISIC8+Kiby4IGCIQgIGtGyyiAtqWJTEKAoqglgWmaXTmd6ZubcpEKAtIEVaHkzV4/kf/lNn7nxtZyYzzel/zpf8Xph7z/m+787cbe6UBicnJycnJycnJycnp0q15OWZqp7g2PYImZQMx7ZHyKRkOLY9QiYlw7HtETIpGY5tj5BJyXBse4RMSoZj2yNkUjIce+TopUkT1EiCbcsRCmkzbFuOUEibYdtyhELaDNuWIxTSZti2HKGQNsO25QiFtBm2LUcopM2wbTmKpQM1kmDbcoRC2gzbliMU0mbYthyhkDbDtuUIhbQZti1HKKTNsG05inn+2Vy4luhedXLF/SrY0aiak8mi8MNFMvKLOrLlVXXi42mFr2mvbFuOol4Qyw/ZvfgWdf7NBtU7f6zqWPuY8neuUvFUa2ERNaAl8qs6/PVr6o+ld6jzc0YZD0e2zi5YhryybTnS76p380P6O1ea8Pn0zLtMnVz5gC7oDdXa9I2Ke5mCYiqhORFR2Z/WqWMbZ6ozS27tLz3HuQVX6mWihetpr2xbjiKZzG1Rz/8nP+iJDU8VlBGmZ94YdXrZ3er4J9PNRvF/XK1SB7brXcduU2zMy5pdWCJ+UCUP7VLpvZtVsH2JOrpplvlUdS+6CY7bj94Y/s7lBeWTR/LKtmUp5gVr8sPGWz3VueZRXE6t0eXTRs33Y9Ae2a48JRJt1+qQx/MDx1szqnPdZFxSraDyt80pLP4Cx6PZ7DVsV6bi6bb7oungr4LgeldydPMrupjRuLAqQseZ4Ptl+aUbyBN5Y5uyFckEz+gD3d/hEjK7NpiDIiquGtAxgY4h4XnJSzztP8326kORtP+sDt8XLqMlvk91rX4IFlgxepdDB/LmZKJgLqaPvLCt+pIO/oj+6PeAUsxuohqfhu5FN6j07o1F4xM0N3lgO/UpOuXTu4BmVBCdnx/7dIbqnXMRLHcw6BSWjisDXmnrOcWebparXe3tY/TVZ6M+B/8XlZXa/606tXw8LLoIfSCna4BkdE/ROATNQXPRnDy9U07RtD9Z04mKI2hXcnrpnbh4TdeqB83GQusSNDbNwdM5IcXa26/Q++YPdGFFB+gcdN+oe/HN/cWfarxXeXu3wmWZPjOmHpuncRpK8Wz2Ll1cU6jISmiisXhYp3KklBoVywRP6HdvEhQ7KGYdvS6NwcM5VSpd4mg6V9f77zQqOx9ahpaldXh1p2rJbAjPf1wX/Vu4ePo3es0VX0NRuXQWQ2WHyjcbgF5zG6AGMsVn/Bml7oJoWbchqiBd4qiI1zY15gUpVPag6HVoXRqDh3MqR3wauq+o2PLZ505Dy5C5EPOCRnS7umL0WGZMdyE2uGJpf0rU87tgiYDUgR9U8uAO+Briwtj+FJ7OKSe6MabfpStQaQgqvmPtJHPjje6Udqyfar6oR8tC9FzuZhwrlvJv12cuLbCoEOb29GfPwdvT5vbzplklP1tk5tRzs436VCwTTIymg15UUBh6iu7cgquKig9DXzum93wJxwhj5tYe2E59SZ8mvlDKgZa+Ruz46ElY9kDQJ8R8GlpLeLCLPHjB82yrPhTz2qaXUj59gd698EZYcimcev8elYjvh2MXQGdJrcE0tidbzZm28Tr0gPf6c6T3fKF63r4cFlsOtAFTv/8M5wjRR97YpkxdeDDL7wDhC6DHBXvmXgILrYRzC65WXtM2OFch/gnyyHblSZ95rMfB/4ee/+x9q/wv4Yeid/7Yob41M2iP69iuLEWz2XH04CsKnYN2O71zL4YFVgN6zGWo3RF5JK9sW450sIUocI5E8yH15zvXweKqyZn3xg19rSDx8XT60QMMy3SunQgLqwXHPn8ReshBXtm2HOl3Vf9PlMLQrif8w4laQtcJqf3fQS8GiT9RgkEZeqwEFVVLuj58GHrJwbblCIUk6MbacL77c9CnYKCn5wi2LUcoJHFky2xY0HBw+KvXoSeCbcsRCkmU/MxnDTi5agL0RLBtOUIhibMLr4flDAf06DryRLBtOUIhiZ65l8JyhgOaG3ki2LYcoT+KZDNsW45QSJth23KEQtoM25YjFNJm2LYcoZA2w7blCIW0GbYtRyikzbBtOUIhbYZtjxyh/+RAMhzbHiGTkuHY9giZlAzHtkfIpGQ4tj1CJiXDse0RMikZjm2PkEnJcGx7hExKhmM7OTk5OTk5OTk5OTmVqYaG/wB0HJGYh5MgJAAAAABJRU5ErkJggg==' width='50' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-bottom: 20px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 600 !important; font-size: 25px; line-height: 35px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                     Account verification is pending!"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 400 !important; font-size: 14px; line-height: 25px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;'>"+
	"                        Great start at Larecoin. <br /><br /> You’ve successfully submitted your verification documents which are currently pending review. Please allow us up to 72 hours to complete your account verification. If there should be a conflict, you will be informed.<br /><br /> Have a great day. "+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 16px; line-height: 35px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                     <table class='button red' cellpadding='0' cellspacing='0' border='0' align='center'> "+
	"                        <tbody>"+
	"                          <tr> "+
	"                           <td align='center' style='color:rgb(255, 255, 255);font-size:14px;font-weight:bold;background-color:rgb(6, 103, 208);text-align:center;padding:12px 22px;border-radius: 34px;max-width:250px;text-decoration: none !important;'><a class='button-link' href='https://www.larecoin.com/#/login' style='color:#ffffff;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255, 255, 255);font-size:12px;font-weight:bold;text-align:center;text-decoration:none;font-family:Helvetica, Arial, sans;letter-spacing: 1px;' rel='noreferrer'>My Account</a>"+
	"                           </td>"+
	"                          </tr>"+
	"                        </tbody>"+
	"                     </table>"+
	"                   </td>"+
	"               </tr>"+
	"            </tbody>"+
	"        </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"                <tr>"+
	"                 <td width='44'><a "+
	"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
	"                  </a>"+
	"               </td>"+
	"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'>"+
	"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
	"                     </a>"+
	"                  </td>"+
	"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
	"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"      </center>"+
	"   </body>"+
	"</html>";

var sendDashEmail = 
	"<html>"+
	"   <head>"+
	"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
	"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
	"      <base target='_blank'>"+
	"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
	"      <style type='text/css' class='existing-message-styles'>body {"+
	"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
	"         }"+
	"         a:visited {"+
	"         color: #ffffff;"+
	"         }"+
	"         a:hover {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         a:active {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         img {"+
	"         -ms-interpolation-mode: bicubic;"+
	"         }"+
	"         @media screen and (max-width: 600px) {"+
	"         .container {"+
	"         width: 100% !important;"+
	"         }"+
	"         .containerPad-cell {"+
	"         padding: 10px !important;"+
	"         }"+
	"         .dividerModules {"+
	"         height: 10px !important;"+
	"         }"+
	"         .subhed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .cellIconHed {"+
	"         width: 25px !important;"+
	"         }"+
	"         .iconHed {"+
	"         width: 25px !important; height: 25px !important;"+
	"         }"+
	"         .secthed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .two-col {"+
	"         padding-top: 10px !important;"+
	"         }"+
	"         .resto-img {"+
	"         width: 100% !important;"+
	"         }"+
	"         .two-col-cell {"+
	"         padding-top: 0 !important;"+
	"         }"+
	"         .two-col-spccol {"+
	"         width: 10px !important;"+
	"         }"+
	"         .resto-title {"+
	"         font-size: 12px !important; line-height: 15px !important;"+
	"         }"+
	"         .stars-img {"+
	"         width: 70px !important;"+
	"         }"+
	"         .dataCard {"+
	"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
	"         }"+
	"         .dataCell {"+
	"         padding-top: 8px !important; width: 119px !important;"+
	"         }"+
	"         .dataType {"+
	"         font-size: 12px !important;"+
	"         }"+
	"         .crave-title {"+
	"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
	"         }"+
	"         .crave-btn {"+
	"         float: none !important; display: block !important; margin: 0 auto !important;"+
	"         }"+
	"         .banner2col-cell {"+
	"         padding: 0 !important;"+
	"         }"+
	"         .cellStack {"+
	"         display: block !important; width: 100% !important;"+
	"         }"+
	"         .grphcDwnld {"+
	"         width: 240px !important;"+
	"         }"+
	"         }"+
	"         @media screen {"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
	"         }"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
	"         }"+
	"         }"+
	"      </style>"+
	"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
	"   </head>"+
	"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
	"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"      </p>"+
	"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
	"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
	"         </div>"+
	"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 30px; line-height: 55px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    You've been invited!"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/emails/speaker.png' width='200' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;background-position: center;background-size: cover;object-fit: cover;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table> "+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;margin-top: 0;padding-top: 40px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 400px; font-family:Helvetica, Arial, sans-serif; font-weight: 500 !important; font-size:14px; line-height: 30px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;color: rgb(34, 31, 31);letter-spacing: 1px;'>Someone referred you to join our movement. Larecoin is the first tuition token and scholarship crypto currency. Register now and receive $10 in larecoin."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 20px auto;padding-top: 30px;padding-bottom: 30px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family:Helvetica, Arial, sans-serif; color: #000000; font-weight: 200 !important; font-size: 16px; line-height: 35px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                     <table class='button red' cellpadding='0' cellspacing='0' border='0' align='center'> "+
	"                        <tbody>"+
	"                          <tr> "+
	"                           <td align='center' style='color:rgb(255, 255, 255);font-size:14px;font-weight:bold;background-color:rgb(6, 103, 208);text-align:center;padding:12px 22px;border-radius: 34px;max-width:250px;text-decoration: none !important;'><a class='button-link' href='https://larecoin.com/#/register' style='color:#ffffff;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255, 255, 255);font-size:12px;font-weight:bold;text-align:center;text-decoration:none;font-family:Helvetica, Arial, sans;letter-spacing: 1px;' rel='noreferrer'>Register</a>"+
	"                           </td>"+
	"                          </tr>"+
	"                        </tbody>"+
	"                     </table>"+
	"                   </td>"+
	"               </tr>"+
	"            </tbody>"+
	"        </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"                <tr>"+
	"                 <td width='44'><a "+
	"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
	"                  </a>"+
	"               </td>"+
	"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'>"+
	"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
	"                     </a>"+
	"                  </td>"+
	"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
	"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"      </center>"+
	"   </body>"+
	"</html>";

	var resolutionSupport = 
	"<html>"+
	"   <head>"+
	"      <meta http-equiv='Content-type' content='text/html; charset=utf-8'>"+
	"      <meta http-equiv='X-UA-Compatible' content='IE=Edge'>"+
	"      <base target='_blank'>"+
	"      <style class='icloud-message-base-styles'>        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Light'),               url('/fonts/SFNSText-Light.woff') format('woff');          font-weight: 300;        }        @font-face {          font-family: 'SFNSText';          src: local('.SFNSText-Medium'),               url('/fonts/SFNSText-Medium.woff') format('woff');          font-weight: 500;        }        body {          background-color: #ffffff;          padding: 13px 20px 0px 20px;          font: 15px 'SFNSText','Helvetica Neue', Helvetica, sans-serif;          font-weight: 300;          line-height: 1.5;          margin: 0px;          overflow: hidden;          word-wrap: break-word;        }        blockquote[type=cite].quoted-plain-text{        line-height:1.5;        padding-bottom: 0px;        white-space: normal;        }        blockquote[type=cite] {          border-left: 2px solid #003399;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #003399;        }        blockquote[type=cite] blockquote[type=cite] {          border-left: 2px solid #006600;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #006600        }        blockquote[type=cite] blockquote[type=cite] blockquote[type=cite] {          border-left : 2px solid #660000;          margin:0;          padding: 0 12px 0 12px;          font-size: 15px;          color: #660000        }        pre {          white-space: pre-wrap;          white-space: -moz-pre-wrap;          white-space: -pre-wrap;          white-space: -o-pre-wrap;          word-wrap: break-word;          white-space: pre-wrap !important;          word-wrap: normal !important;          font-size: 15px;        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-2{          transform:scaleX(-1);          -webkit-transform:scaleX(-1);          -ms-transform:scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-3{          transform:rotate(180deg);          -webkit-transform:rotate(180deg);          -ms-transform:rotate(180deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-4{          transform:rotate(180deg) scaleX(-1);          -webkit-transform:rotate(180deg) scaleX(-1);          -ms-transform:rotate(180deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-5{          transform:rotate(270deg) scaleX(-1);          -webkit-transform:rotate(270deg) scaleX(-1);          -ms-transform:rotate(270deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-6{          transform:rotate(90deg);          -webkit-transform:rotate(90deg);          -ms-transform:rotate(90deg);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-7{          transform:rotate(90deg) scaleX(-1);          -webkit-transform:rotate(90deg) scaleX(-1);          -ms-transform:rotate(90deg) scaleX(-1);        }        .pre-fa658472-dc9a-4739-a0c3-07604b6dccfe-orientation-8{          transform:rotate(270deg);          -webkit-transform:rotate(270deg);          -ms-transform:rotate(270deg);        }        .x-apple-maildropbanner {          margin-top:-13px;        }        a.view-message-icloud-share,        a.view-message-icloud-share:visited {          cursor: pointer;          color: #0000EE;          text-decoration: underline;        }        a.view-message-icloud-share:hover{          text-decoration: underline;        }    </style>"+
	"      <style type='text/css' class='existing-message-styles'>body {"+
	"         margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;"+
	"         }"+
	"         a:visited {"+
	"         color: #ffffff;"+
	"         }"+
	"         a:hover {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         a:active {"+
	"         color: #ffffff !important;"+
	"         }"+
	"         img {"+
	"         -ms-interpolation-mode: bicubic;"+
	"         }"+
	"         @media screen and (max-width: 600px) {"+
	"         .container {"+
	"         width: 100% !important;"+
	"         }"+
	"         .containerPad-cell {"+
	"         padding: 10px !important;"+
	"         }"+
	"         .dividerModules {"+
	"         height: 10px !important;"+
	"         }"+
	"         .subhed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .cellIconHed {"+
	"         width: 25px !important;"+
	"         }"+
	"         .iconHed {"+
	"         width: 25px !important; height: 25px !important;"+
	"         }"+
	"         .secthed {"+
	"         font-size: 16px !important;"+
	"         }"+
	"         .two-col {"+
	"         padding-top: 10px !important;"+
	"         }"+
	"         .resto-img {"+
	"         width: 100% !important;"+
	"         }"+
	"         .two-col-cell {"+
	"         padding-top: 0 !important;"+
	"         }"+
	"         .two-col-spccol {"+
	"         width: 10px !important;"+
	"         }"+
	"         .resto-title {"+
	"         font-size: 12px !important; line-height: 15px !important;"+
	"         }"+
	"         .stars-img {"+
	"         width: 70px !important;"+
	"         }"+
	"         .dataCard {"+
	"         padding-left: 8px !important; padding-right: 8px !important; padding-bottom: 8px !important;"+
	"         }"+
	"         .dataCell {"+
	"         padding-top: 8px !important; width: 119px !important;"+
	"         }"+
	"         .dataType {"+
	"         font-size: 12px !important;"+
	"         }"+
	"         .crave-title {"+
	"         display: block !important; width: 100% !important; padding-bottom: 10px; font-size: 14px !important; line-height: 18px !important; text-align: center;"+
	"         }"+
	"         .crave-btn {"+
	"         float: none !important; display: block !important; margin: 0 auto !important;"+
	"         }"+
	"         .banner2col-cell {"+
	"         padding: 0 !important;"+
	"         }"+
	"         .cellStack {"+
	"         display: block !important; width: 100% !important;"+
	"         }"+
	"         .grphcDwnld {"+
	"         width: 240px !important;"+
	"         }"+
	"         }"+
	"         @media screen {"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-bold'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-bold-webfont.woff') format('woff');"+
	"         }"+
	"         @font-face {"+
	"         font-family: 'GrubhubSans-light'; font-style: normal; font-weight: 400; src: url('http://res.cloudinary.com/grubhub-marketing/raw/upload/v1504031857/CRM/fonts/grubhub-sans-light-webfont.woff') format('woff');"+
	"         }"+
	"         }"+
	"      </style>"+
	"      <style class='icloud-message-dynamic-styles'> img._auto-scale, img._stretch {max-width: 783px !important;width: auto !important; height: auto !important; } span.body-text-content {white-space:pre-wrap;} iframe.attachment-pdf {width: 778px; height:847px;}._stretch {max-width: 783px; } ._mail-body {width:783px; }</style>"+
	"   </head>"+
	"   <body style='height: 100% !important; width: 100% !important; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 auto;'>"+
	"      <p style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"      </p>"+
	"      <center style='width: 100% !important; text-align: center; background-color: #ffffff; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; '>"+
	"         <div style='display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"            Larecoin is an upgradeable P2P token used for education. Inclusive to it's own token and digital asset exchange, larecoin is used on a three layer technology engineered for students (lareX), educational systems (lareVIA) and business (lareR) use cases. A first of its kind block chain technology now fueling the future of global education."+
	"         </div>"+
	"         <table class='container' width='600' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0' style='width: 600px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;border-radius: 3px;padding: 30px;padding-top: 15px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td bgcolor='#ffffff' align='left' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoColor.png' width='130' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                  <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top: 0px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI2IDI2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNiAyNiIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4Ij4KICA8cGF0aCBkPSJtLjMsMTRjLTAuMi0wLjItMC4zLTAuNS0wLjMtMC43czAuMS0wLjUgMC4zLTAuN2wxLjQtMS40YzAuNC0wLjQgMS0wLjQgMS40LDBsLjEsLjEgNS41LDUuOWMwLjIsMC4yIDAuNSwwLjIgMC43LDBsMTMuNC0xMy45aDAuMXYtOC44ODE3OGUtMTZjMC40LTAuNCAxLTAuNCAxLjQsMGwxLjQsMS40YzAuNCwwLjQgMC40LDEgMCwxLjRsMCwwLTE2LDE2LjZjLTAuMiwwLjItMC40LDAuMy0wLjcsMC4zLTAuMywwLTAuNS0wLjEtMC43LTAuM2wtNy44LTguNC0uMi0uM3oiIGZpbGw9IiM5MURDNUEiLz4KPC9zdmc+Cg==' width='60' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 40px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'><br /></td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: gray; font-weight: 900 !important; font-size: 10px; line-height: 15px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;text-transform: uppercase;'>"+
	"                    <b>Case Number</b>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 300 !important; font-size: 27px; line-height: 40px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    {{CASENUMBER}}"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 40px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'><br /></td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: gray; font-weight: 900 !important; font-size: 10px; line-height: 15px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;text-transform: uppercase;'>"+
	"                    <b>Your Message</b>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 300 !important; font-size: 15px; line-height: 40px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    {{YOURMESSAGE}}"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 25px; font-size: 0; line-height: 40px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'><br /></td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: black font-weight: 900 !important; font-size: 10px; line-height: 15px;letter-spacing: 1px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;text-transform: uppercase;'>"+
	"                    <b>Resolution</b>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;margin-bottom: 0;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='600' align='left' style='width: 470px; font-family:Helvetica, Arial, sans-serif; color: #333; font-weight: 300 !important; font-size: 20px; line-height: 30px;letter-spacing: 0px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 0px;'>"+
	"                    {{RESOLUTION}}"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"                <hr style='border: 0;border-bottom: 1px solid #235bbe;' />"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='dividerModules' style='height: 15px; font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>&nbsp;</td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"                <tr>"+
	"                 <td width='44'><a "+
	"                     href='https://www.facebook.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yODgsMTc2di02NGMwLTE3LjY2NCwxNC4zMzYtMzIsMzItMzJoMzJWMGgtNjRjLTUzLjAyNCwwLTk2LDQyLjk3Ni05Niw5NnY4MGgtNjR2ODBoNjR2MjU2aDk2VjI1Nmg2NGwzMi04MEgyODh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='f' style='border-width:0;height:auto;display:block;Margin:0 auto;'/>"+
	"                  </a>"+
	"               </td>"+
	"                  <td width='44'><a href='https://linkedin.com/company/larecoin' style='color:#5a6e7a;text-decoration:underline;' ><img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxyZWN0IHk9IjE2MCIgd2lkdGg9IjExNC40OTYiIGhlaWdodD0iMzUyIiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDI2LjM2OCwxNjQuMTI4Yy0xLjIxNi0wLjM4NC0yLjM2OC0wLjgtMy42NDgtMS4xNTJjLTEuNTM2LTAuMzUyLTMuMDcyLTAuNjQtNC42NC0wLjg5NiAgICBjLTYuMDgtMS4yMTYtMTIuNzM2LTIuMDgtMjAuNTQ0LTIuMDhjLTY2Ljc1MiwwLTEwOS4wODgsNDguNTQ0LTEyMy4wNCw2Ny4yOTZWMTYwSDE2MHYzNTJoMTE0LjQ5NlYzMjAgICAgYzAsMCw4Ni41MjgtMTIwLjUxMiwxMjMuMDQtMzJjMCw3OS4wMDgsMCwyMjQsMCwyMjRINTEyVjI3NC40NjRDNTEyLDIyMS4yOCw0NzUuNTUyLDE3Ni45Niw0MjYuMzY4LDE2NC4xMjh6IiBmaWxsPSIjYWJhYmFiIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI1NiIgY3k9IjU2IiByPSI1NiIgZmlsbD0iI2FiYWJhYiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=' width='20' height='20' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'>"+
	"                     <a href='https://instagram.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                        <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNTIsMEgxNjBDNzEuNjQ4LDAsMCw3MS42NDgsMCwxNjB2MTkyYzAsODguMzUyLDcxLjY0OCwxNjAsMTYwLDE2MGgxOTJjODguMzUyLDAsMTYwLTcxLjY0OCwxNjAtMTYwVjE2MCAgICBDNTEyLDcxLjY0OCw0NDAuMzUyLDAsMzUyLDB6IE00NjQsMzUyYzAsNjEuNzYtNTAuMjQsMTEyLTExMiwxMTJIMTYwYy02MS43NiwwLTExMi01MC4yNC0xMTItMTEyVjE2MEM0OCw5OC4yNCw5OC4yNCw0OCwxNjAsNDggICAgaDE5MmM2MS43NiwwLDExMiw1MC4yNCwxMTIsMTEyVjM1MnoiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yNTYsMTI4Yy03MC42ODgsMC0xMjgsNTcuMzEyLTEyOCwxMjhzNTcuMzEyLDEyOCwxMjgsMTI4czEyOC01Ny4zMTIsMTI4LTEyOFMzMjYuNjg4LDEyOCwyNTYsMTI4eiBNMjU2LDMzNiAgICBjLTQ0LjA5NiwwLTgwLTM1LjkwNC04MC04MGMwLTQ0LjEyOCwzNS45MDQtODAsODAtODBzODAsMzUuODcyLDgwLDgwQzMzNiwzMDAuMDk2LDMwMC4wOTYsMzM2LDI1NiwzMzZ6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzOTMuNiIgY3k9IjExOC40IiByPSIxNy4wNTYiIGZpbGw9IiNhZGFkYWQiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K' width='20' height='20' alt='t' style='border-width:0;height:auto;display:block;Margin:0 auto;' />"+
	"                     </a>"+
	"                  </td>"+
	"                  <td width='44'><a href='https://twitter.com/larecoin/' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTI4cHgiIGhlaWdodD0iMTI4cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik01MTIsOTcuMjQ4Yy0xOS4wNCw4LjM1Mi0zOS4zMjgsMTMuODg4LTYwLjQ4LDE2LjU3NmMyMS43Ni0xMi45OTIsMzguMzY4LTMzLjQwOCw0Ni4xNzYtNTguMDE2ICAgIGMtMjAuMjg4LDEyLjA5Ni00Mi42ODgsMjAuNjQtNjYuNTYsMjUuNDA4QzQxMS44NzIsNjAuNzA0LDM4NC40MTYsNDgsMzU0LjQ2NCw0OGMtNTguMTEyLDAtMTA0Ljg5Niw0Ny4xNjgtMTA0Ljg5NiwxMDQuOTkyICAgIGMwLDguMzIsMC43MDQsMTYuMzIsMi40MzIsMjMuOTM2Yy04Ny4yNjQtNC4yNTYtMTY0LjQ4LTQ2LjA4LTIxNi4zNTItMTA5Ljc5MmMtOS4wNTYsMTUuNzEyLTE0LjM2OCwzMy42OTYtMTQuMzY4LDUzLjA1NiAgICBjMCwzNi4zNTIsMTguNzIsNjguNTc2LDQ2LjYyNCw4Ny4yMzJjLTE2Ljg2NC0wLjMyLTMzLjQwOC01LjIxNi00Ny40MjQtMTIuOTI4YzAsMC4zMiwwLDAuNzM2LDAsMS4xNTIgICAgYzAsNTEuMDA4LDM2LjM4NCw5My4zNzYsODQuMDk2LDEwMy4xMzZjLTguNTQ0LDIuMzM2LTE3Ljg1NiwzLjQ1Ni0yNy41MiwzLjQ1NmMtNi43MiwwLTEzLjUwNC0wLjM4NC0xOS44NzItMS43OTIgICAgYzEzLjYsNDEuNTY4LDUyLjE5Miw3Mi4xMjgsOTguMDgsNzMuMTJjLTM1LjcxMiwyNy45MzYtODEuMDU2LDQ0Ljc2OC0xMzAuMTQ0LDQ0Ljc2OGMtOC42MDgsMC0xNi44NjQtMC4zODQtMjUuMTItMS40NCAgICBDNDYuNDk2LDQ0Ni44OCwxMDEuNiw0NjQsMTYxLjAyNCw0NjRjMTkzLjE1MiwwLDI5OC43NTItMTYwLDI5OC43NTItMjk4LjY4OGMwLTQuNjQtMC4xNi05LjEyLTAuMzg0LTEzLjU2OCAgICBDNDgwLjIyNCwxMzYuOTYsNDk3LjcyOCwxMTguNDk2LDUxMiw5Ny4yNDh6IiBmaWxsPSIjYWRhZGFkIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"                  <td width='44'><a href='https://bitcointalk.com/larecoin' style='color:#5a6e7a;text-decoration:underline;' >"+
	"                     <img src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEyOHB4IiBoZWlnaHQ9IjEyOHB4IiB2aWV3Qm94PSIwIDAgNDc1LjA3NCA0NzUuMDc0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzUuMDc0IDQ3NS4wNzQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMzk1LjY1NSwyNDkuMjM2Yy0xMS4wMzctMTQuMjcyLTI3LjY5Mi0yNC4wNzUtNDkuOTY0LTI5LjQwM2MyOC4zNjItMTQuNDY3LDQwLjgyNi0zOS4wMjEsMzcuNDA0LTczLjY2NiAgIGMtMS4xNDQtMTIuNTYzLTQuNjE2LTIzLjQ1MS0xMC40MjQtMzIuNjhjLTUuODEyLTkuMjMxLTEzLjY1NS0xNi42NTItMjMuNTU5LTIyLjI2NmMtOS44OTYtNS42MjEtMjAuNjU5LTkuOS0zMi4yNjQtMTIuODUgICBjLTExLjYwOC0yLjk1LTI0LjkzNS01LjA5Mi0zOS45NzItNi40MjNWMGgtNDMuOTY0djY5Ljk0OWMtNy42MTMsMC0xOS4yMjMsMC4xOS0zNC44MjksMC41NzFWMGgtNDMuOTd2NzEuOTQ4ICAgYy02LjI4MywwLjE5MS0xNS41MTMsMC4yODgtMjcuNjk0LDAuMjg4bC02MC41MjYtMC4yODh2NDYuODI0aDMxLjY4OWMxNC40NjYsMCwyMi45MzYsNi40NzMsMjUuNDEsMTkuNDE0djgxLjk0MiAgIGMxLjkwNiwwLDMuNDI3LDAuMDk4LDQuNTcsMC4yODhoLTQuNTd2MTE0Ljc2OWMtMS41MjEsOS43MDUtNy4wNCwxNC41NjItMTYuNTU4LDE0LjU2Mkg3NC43NDdsLTguODUyLDUyLjI0OWg1Ny4xMDIgICBjMy42MTcsMCw4Ljg0OCwwLjA0OCwxNS43MDMsMC4xMzRjNi44NTEsMC4wOTYsMTEuOTg4LDAuMTQ0LDE1LjQxNSwwLjE0NHY3Mi44MDNoNDMuOTc3di03MS45NDcgICBjNy45OTIsMC4xOTUsMTkuNjAyLDAuMjg4LDM0LjgyOSwwLjI4OHY3MS42NTloNDMuOTY1di03Mi44MDNjMTUuNjExLTAuNzYsMjkuNDU3LTIuMTgsNDEuNTM4LTQuMjgxICAgYzEyLjA4Ny0yLjEwMSwyMy42NTMtNS4zNzksMzQuNjktOS44NTVjMTEuMDM2LTQuNDcsMjAuMjY2LTEwLjA0MSwyNy42ODgtMTYuNzAzYzcuNDI2LTYuNjU2LDEzLjU1OS0xNS4xMywxOC40MjEtMjUuNDEgICBjNC44NDYtMTAuMjgsNy45NDMtMjIuMTc2LDkuMjcxLTM1LjY5M0M0MTAuOTc5LDI4My44ODIsNDA2LjY5NCwyNjMuNTE0LDM5NS42NTUsMjQ5LjIzNnogTTE5OC45MzgsMTIxLjkwNCAgIGMxLjMzMywwLDUuMDkyLTAuMDQ4LDExLjI3OC0wLjE0NGM2LjE4OS0wLjA5OCwxMS4zMjYtMC4xOTIsMTUuNDE4LTAuMjg4YzQuMDkzLTAuMDk0LDkuNjEzLDAuMTQ0LDE2LjU2MywwLjcxNSAgIGM2Ljk0NywwLjU3MSwxMi43OTksMS4zMzQsMTcuNTU2LDIuMjg0czkuOTk2LDIuNTIxLDE1LjcwMSw0LjcxYzUuNzE1LDIuMTg3LDEwLjI4LDQuODUzLDEzLjcwMiw3Ljk5MyAgIGMzLjQyOSwzLjE0LDYuMzMxLDcuMTM5LDguNzA2LDExLjk5M2MyLjM4Miw0Ljg1MywzLjU3MiwxMC40MiwzLjU3MiwxNi43YzAsNS4zMy0wLjg1NSwxMC4xODUtMi41NjYsMTQuNTY1ICAgYy0xLjcwOCw0LjM3Ny00LjI4NCw4LjA0Mi03LjcwNiwxMC45OTJjLTMuNDIzLDIuOTUxLTYuOTUxLDUuNTIzLTEwLjU2OCw3LjcxYy0zLjYxMywyLjE4Ny04LjIzMywzLjk0OS0xMy44NDYsNS4yOCAgIGMtNS42MTIsMS4zMzMtMTAuNTEzLDIuMzgtMTQuNjk4LDMuMTRjLTQuMTg4LDAuNzYyLTkuNDIxLDEuMjg3LTE1LjcwMywxLjU3MWMtNi4yODMsMC4yODQtMTEuMDQzLDAuNDc4LTE0LjI3NywwLjU3MiAgIGMtMy4yMzcsMC4wOTQtNy42NjEsMC4wOTQtMTMuMjc4LDBjLTUuNjE4LTAuMDk0LTguODk3LTAuMTQ0LTkuODUxLTAuMTQ0di04Ny42NUgxOTguOTM4eiBNMzE4Ljk5OCwzMTYuMzMxICAgYy0xLjgxMyw0LjM4LTQuMTQxLDguMTg5LTYuOTk0LDExLjQyN2MtMi44NTgsMy4yMy02LjYxOSw2LjA4OC0xMS4yOCw4LjU1OWMtNC42NiwyLjQ3OC05LjE4NSw0LjQ3My0xMy41NTksNS45OTYgICBjLTQuMzgsMS41MjktOS42NjQsMi44NTQtMTUuODQ0LDRjLTYuMTk0LDEuMTQzLTExLjYxNSwxLjk0Ny0xNi4yODMsMi40MjZjLTQuNjYxLDAuNDc3LTEwLjIyNiwwLjg1Ni0xNi43LDEuMTQ0ICAgYy02LjQ2OSwwLjI4LTExLjUxNiwwLjQyNS0xNS4xMzEsMC40MjVjLTMuNjE3LDAtOC4xODYtMC4wNTItMTMuNzA2LTAuMTQ1Yy01LjUyMy0wLjA4OS05LjA0MS0wLjEzNy0xMC41NjUtMC4xMzd2LTk2LjUwNSAgIGMxLjUyMSwwLDYuMDQyLTAuMDkzLDEzLjU2Mi0wLjI4N2M3LjUyMS0wLjE5MiwxMy42NTYtMC4yODEsMTguNDE1LTAuMjgxYzQuNzU4LDAsMTEuMzI3LDAuMjgxLDE5LjcwNSwwLjg1NiAgIGM4LjM3LDAuNTY3LDE1LjQxMywxLjQyLDIxLjEyOCwyLjU2MmM1LjcwOCwxLjE0NCwxMS45MzcsMi45MDIsMTguNjk5LDUuMjg0YzYuNzU1LDIuMzc4LDEyLjIzLDUuMjgsMTYuNDE5LDguNzA2ICAgYzQuMTg4LDMuNDMyLDcuNzA3LDcuODAzLDEwLjU2MSwxMy4xMzRjMi44NjEsNS4zMjgsNC4yODgsMTEuNDIsNC4yODgsMTguMjc0QzMyMS43MTIsMzA3LjEwNCwzMjAuODA5LDMxMS45NSwzMTguOTk4LDMxNi4zMzF6IiBmaWxsPSIjYWRhZGFkIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' width='20' height='20' alt='g+' style='border-width:0;height:auto;display:block;Margin:0 auto;' /></a></td>"+
	"            </tbody>"+
	"         </table>"+
	"         <table cellpadding='0' cellspacing='0' border='0' style='padding-top: 10px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td width='520' align='center' style='width: 520px; font-family: Arial, Helvetica, sans-serif; color: #b7b7b7; font-size: 10px; line-height: 13px; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; padding: 20px;padding-bottom: 0;'>"+
	"                     (c)&nbsp;2018&nbsp;Larecoin. The Larecoin logo is a registered trademark of Larecoin Limited. All rights reserved. This&nbsp;email was sent to the address&nbsp;{{email}}."+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"         <table width='100%' bgcolor='#ffffff' cellpadding='17' cellspacing='0' border='0' style='width: 100%; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-spacing: 0px !important; table-layout: fixed !important; margin: 0px auto;padding-top:30px;'>"+
	"            <tbody>"+
	"               <tr style='-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;'>"+
	"                  <td class='fedImage' width='100%' align='center' bgcolor='#ffffff' style='font-size: 0; line-height: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;'>"+
	"                     <a href='https://larecoin.com' style='color: #339999; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;' rel='noreferrer'>"+
	"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
	"                     </a>"+
	"                  </td>"+
	"               </tr>"+
	"            </tbody>"+
	"         </table>"+
	"      </center>"+
	"   </body>"+
	"</html>";
