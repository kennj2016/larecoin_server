var AmazonS3 = require('../../node_modules/aws-sdk');
var AmazonSES = require('../../node_modules/amazon-ses-mailer');
var ses = new AmazonSES('AKIAIXOSOWERN7J62PUA', 'yi4O3Nf3YslNjBSngX7ytTNa4w+2qnDL+5e39qYR', 'us-east-1');

var XMLHttpRequest = require("../../node_modules/xmlhttprequest").XMLHttpRequest;
var Coinpayments = require('./coinpayments');
var keys = {
	"BTC": {
		"key":"7ad22b94344352b048b89ef4096b201cd13837b0f5b47658c6ff1c82a6c6a17d",
		"secret":"5df00C9FdCa42ff844bF784A64ee33EAd677dA0419596a18b8DC73ca271dFcdD"
	},
	"ETH": {
		"key":"2b55c8fb0cc23818f03b819ccf3bcd054fc1ebf9a97b4c8027a0622956b4d3a4",
		"secret":"D7c89F53fd05265bbaB5D8b11491A87d17f4979910474E495447434f194C763c"
	},
	"BCH": {
		"key":"71a79c0f0358dae1caeb2f031d0396306d151f6ef8aa46e9e5f1a83b63a9a70d",
		"secret":"631835E63f00300dC3f01Fc34548dBa82D1f9e6A6b72164C67B75957961ffEe2"
	},
	"NEO": {
		"key":"37ec86a16052f4100d73aa70acffaa07565b2825490c0f18d489895a44b491f0",
		"secret":"AdB2Be752F96e15b32bCDfE2dfefE50D1b07B49EB0CEa9460d1B5fdee3E0ee4f"
	},
	"XVG": {
		"key":"139d801d1adc269e49f9ee260e3d2ce8025ec68a2b55a3f436856dc4f9895efb",
		"secret":"46D336C7372c603197C095e757eb9106b6B63E8db9058141C339BEe96Ed4E09c"
	},
	"XRP": {
		"key":"d06db8e69dd42651c7beb63b38c8c0cca0c4a1fcf387498ade48606ada69309a",
		"secret":"761FdFdcb59c19edd00cD968f42C88F6A3fd42322e8E85f45655D6d6A44F95C9"
	},
	"ZEC": {
		"key":"1f0bfb5380322032222fa29fe4933906ce44d13f34de671e806cc2b047f02dea",
		"secret":"6BeC94BfCa7461686589739CB5d20AB25a921Ad15Eb4671cb6d696Cd88d2a311"
	},
	"ZEN": {
		"key":"165fbc2348170ba66fb4087b39c93756c868d56ae0d645cea6e59c8bcc55c4d2",
		"secret":"59b4925184F7882D9933861Afc796bd3105c8E45eb6c48039FbD04f5B3700472"
	},
	"DASH": {
		"key":"02840a513ef98d5434877f5f77c4fdb3879544185dcfce693fede2b4bd2abf2a",
		"secret":"c4408b35D8E25aa8F7f102F91422f59605c9557303052DCE9b56844d00281c1b"
	},
	"LTC": {
		"key":"5584884e0e8de02e8a42bc4584a83cc8f3b2bd66aa7e4f93bb6d1975e3279daf",
		"secret":"8D23Ea6e7a308962787767Ade32DcE35C16f899E3775943bcd05165bB4EFe117"
	},
	"XMR":{
		"key":"d06db8e69dd42651c7beb63b38c8c0cca0c4a1fcf387498ade48606ada69309a",
		"secret":"761FdFdcb59c19edd00cD968f42C88F6A3fd42322e8E85f45655D6d6A44F95C9"
	}
}






Parse.Cloud.define('getRates', function(request, response) {
	var options = {
		"key":"7ad22b94344352b048b89ef4096b201cd13837b0f5b47658c6ff1c82a6c6a17d",
		"secret":"5df00C9FdCa42ff844bF784A64ee33EAd677dA0419596a18b8DC73ca271dFcdD"
	}
	var client = new Coinpayments(options); 
	client.rates({}, function (err, res) {
		if (err) {
			response.error(err);
		} else {
			response.success(res);
		}
	});
});


Parse.Cloud.define('getRatesandtotalLare', function(request, response) {
	var options = {
		"key":"7ad22b94344352b048b89ef4096b201cd13837b0f5b47658c6ff1c82a6c6a17d",
		"secret":"5df00C9FdCa42ff844bF784A64ee33EAd677dA0419596a18b8DC73ca271dFcdD"
	}
	var id = request.params.id;
	
	var GameScore = Parse.Object.extend("_User");
	var query = new Parse.Query(GameScore);
	query.get(id, {
	  success: function(gameScore) {
		var client = new Coinpayments(options); 
		client.rates({}, function (err, res) {
			if (err) {
				response.error(err);
			} else {
				var userPointer1 = {
				  "__type": 'Pointer',
				  "className": '_User',
				  "objectId": id
				}
				var totalAmount = 0;
			  	totalAmount += parseFloat(gameScore.get('totalLare'));
				var Referrals = Parse.Object.extend("Referrals");
				var query = new Parse.Query(Referrals);
				query.equalTo("active", false);
				query.equalTo("referee", userPointer1);
				query.find({
				  success: function(results) {
				    for (var i = 0; i < results.length; i++) {
				      var object = results[i];
				      	totalAmount += parseFloat(object.get('totalRewarded'));
				    }
				  	var results = {
				  		"totalLare":totalAmount.toString(),
				  		"res":res
				  	}
					response.success(results);
				  },
				  error: function(error) {
				   response.error(error);
				  }
				});

			}
		});
	  },
	  error: function(object, error) {
	  response.error(error);
	  }
	});
});





Parse.Cloud.define('getTotalLare', function(request, response) {
	var userPointer1 = {
	  "__type": 'Pointer',
	  "className": '_User',
	  "objectId": request.params.id
	}
	var totalAmount = 0;
	var GameScore = Parse.Object.extend("_User");
	var query = new Parse.Query(GameScore);
	query.get(request.params.id, {
	  success: function(object) {
	  	totalAmount += parseFloat(object.get('totalLare'));
		var Referrals = Parse.Object.extend("Referrals");
		var query = new Parse.Query(Referrals);
		query.equalTo("active", false);
		query.equalTo("referee", userPointer1);
		query.find({
		  success: function(results) {
		    for (var i = 0; i < results.length; i++) {
		      var object = results[i];
		      	totalAmount += parseFloat(object.get('totalRewarded'));
		    }
		    response.success(totalAmount.toString());
		  },
		  error: function(error) {
		   response.error(error);
		  }
		});
	  },
	  error: function(object, error) {
 		response.error(error);
	  }
	});
});


// Parse.Cloud.define('getTokenSummaryDetails', function(request, response) {
// 	var GameScore = Parse.Object.extend("_User");
// 	var query = new Parse.Query(GameScore);
// 	query.count({
// 	  success: function(results) {
// 		  var usersTotal = results;
// 	      var config = Parse.Object.extend("config");
// 	      var query2 = new Parse.Query(config);
// 	      query2.get("k7t0S4tWWZ", {
// 	        success: function(ob) {
// 	          var data = ob.get('totalLare');
// 	           response.success({"usersTotal":usersTotal,"totalLares":data});
// 	        },
// 	        error: function(object, error) {
// 	        	response.error(error);
// 	        }
// 	      });
// 	  },
// 	  error: function(error) {
// 		 response.error(error)
// 	  }
// 	});
	
// });







Parse.Cloud.define('createTransaction', function(request, response) {
	var c1 = request.params.c1;
	var c2 = request.params.c2;
	var options = {
		"key":keys[c2].key,
		"secret":keys[c2].secret
	}
	var client = new Coinpayments(options); 
	var amount = request.params.amount;
	client.createTransaction(
		{
			'currency1' : c1,
			'currency2' : c2,
			'amount' : amount,
			"buyer_name": request.params.user.objectId,
			"ipn_url":"https://larecoin.herokuapp.com/api/coinpayments",
			"custom":request.params.totalLare + "::::" + request.params.email
		}
		,function(err,result) {
		if (err) {
			response.error(err);
		} else {
			var t = new Date();
			t.setSeconds(t.getSeconds() + result.timeout);
			var Transactions = Parse.Object.extend("Transactions");
			var gameScore = new Transactions();
			gameScore.set("userId", request.params.user);
			gameScore.set("currencyFrom", c2);
			gameScore.set("currencyTo", "LARE");
			gameScore.set("amount", amount);
			gameScore.set("bonusPercent", request.params.bonusPercent);
			gameScore.set("totalLare", request.params.totalLare);
			gameScore.set("feePercent", request.params.feePercent);
			gameScore.set("txn_id", result.txn_id);
			gameScore.set("confirms_needed", result.confirms_needed);
			gameScore.set("address", result.address);
			gameScore.set("totalSend", result.amount);
			gameScore.set("status", "Open");
			gameScore.set("Details", "Waiting for buyer funds...");
			gameScore.set("ExpireDate", t.toString());
			gameScore.set("type","Deposit");
			gameScore.set("status_url",result.status_url);
			gameScore.set('qrcode_url',response.qrcode_url);
			gameScore.save(null, {
			  success: function(gameScore) {
			  	response.success(result);
			  },
			  error: function(gameScore, error) {
			   response.error(error)
			  }
			});
		}
	});
});




Parse.Cloud.define('getTransaction', function(request, response) {
	if (request.params.status == "Open") {
		var Transactions = Parse.Object.extend("Transactions");
		var query = new Parse.Query(Transactions);
		query.equalTo("userId", request.params.user);
		query.equalTo("status","Open");
		query.descending("createdAt");
		query.limit(3)
		query.find({
		  success: function(results) {
		  	response.success(results)
		  },
		  error: function(error) {
		  	response.error(error)
		  }
		});		
	} else {
		var Transactions = Parse.Object.extend("Transactions");
		var query = new Parse.Query(Transactions);
		query.equalTo("userId", request.params.user);
		query.descending("createdAt");
		query.limit(3)
		query.find({
		  success: function(results) {
		  	response.success(results)
		  },
		  error: function(error) {
		  	response.error(error)
		  }
		});			
	}
});

Parse.Cloud.define('cancelTransaction', function(request, response) {
	var GameScore = Parse.Object.extend("Transactions");
	var query = new Parse.Query(GameScore);
	query.equalTo("objectId",request.params.objectId);
	query.first({
	  success: function(data) {
		data.set("status", "Canceled");
		data.set("Details", "Canceled By User");
		data.save(null,{useMasterKey:true}, {
		  success: function(gameScore) {
		  	response.success('done');
		  }, error:function(err){
		  	response.error(err)
		  }
		});
		response.success('Done');
	  },
	  error: function(error) {
	   response.error(error)
	  }
	});
});
















