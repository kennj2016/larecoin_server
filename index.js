var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('express-cors')


require('@risingstack/trace');
require('dotenv').config()
var AmazonSES = require('./node_modules/amazon-ses-mailer');
var ses = new AmazonSES('AKIAIXOSOWERN7J62PUA', 'yi4O3Nf3YslNjBSngX7ytTNa4w+2qnDL+5e39qYR', 'us-east-1');

var S3Adapter = require('parse-server').S3Adapter;
var s3Adapter = new S3Adapter(
    "AKIAIXOSOWERN7J62PUA",
    "yi4O3Nf3YslNjBSngX7ytTNa4w+2qnDL+5e39qYR",
    "larecoin/profileImages",
    { directAccess: true }
);





var MONGOURI = process.env.MONGOURI || 'mongodb://heroku_f7lwktpj:pho1grven497djf9ttssehe51r@ds135399.mlab.com:35399/heroku_f7lwktpj'
var publicServerURL = process.env.PUBLIC_SERVER_URL || 'https://larecoin.herokuapp.com/parse'

var api = new ParseServer({
  databaseURI: MONGOURI,
  cloud:  __dirname + '/cloud/main.js',
  appId: 'p94Lp2L9heC5ZAKaPfAkbhB5FaxtLfyAV25ePwwsQUTMH7cZY4UkUrRBXAvEC6nJQUgZ32hdAS2KDfKFjTzrMMzEDCYHCZmn8ND4epbG3xef7J7eHqTFmKBRQN',
  masterKey: 'MVaeXFSX4rYjqThft2P3RWTGePFCfjfW4GUj9cGcqzStsaDzhqGjWa2QR5QcHFHDTsetDYhqEp5MzxSZCXNvRTFWTxAqZeFLjGusndx8at3NtHhpXdu2fRGsRF',
  serverURL: publicServerURL,
  //clientKey:"aBrEscU8MNhsKsGW9bKVNS2HqH2wYTT8cuvgcGRgF6PWMVNAcBGTwn7adLevHs9WY9cVGL7uySrARZFvccd5P98CVckLWTLprn2",
  appName:'Larecoin',
  publicServerURL:publicServerURL,
  emailAdapter: {
      module: "parse-server-amazon-ses-adapter",
      options: {
         from: "Larecoin <support@larecoin.com>",
         accessKeyId: "AKIAIXOSOWERN7J62PUA",
         secretAccessKey: "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",
         region: "us-east-1"
      }
   },
  customPages: {
    invalidLink:'public/invalidlink.html',
    choosePassword: '/public/resetPassword.html',
    passwordResetSuccess: '/public/passwordSuccess.html'
  },
  passwordPolicy: {
    validatorCallback: (password) => { return validatePassword(password) },
    doNotAllowUsername: true,
    maxPasswordAge: 30,
    maxPasswordHistory: 2,
    resetTokenValidityDuration: 720*60*60,
  },
  filesAdapter: s3Adapter,
  fileKey: process.env.PARSE_FILE_KEY,
  liveQuery: {
    classNames: ["Posts", "Comments"]
  }
});

function validatePassword(password) {
    var isValid = /^(?=.*[A-Za-z])(?=.*\w)[A-Za-z!-=\w]{8,}$/.test(password) && password !== "";
    //1 number, 8 characters, 1 uppercase, 1 lowercase
    return isValid;
}




var app = express();

app.use(cors({
    allowedOrigins: [
        'http://localhost:4000',
        'http://larecoin.kennjdemo.com'
    ],
    headers:[
        'X-Requested-With',
        'Content-Type',
        "Access-Control-Allow-Headers",
        "Authorization",
        "X-Parse-Application-ID",
        "X-Parse-JavaScript-Key"
    ]
}))

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
    res.send('API is running');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//aDf973vVwxYz93e4
app.post('/api/coinpayments', function(req, res){
  var body = req.body;
  var totalLare = body.custom.split('::::')[0];
  var email = body.custom.split('::::')[1];

  if (body.ipn_type == "api" && body.merchant == "2d657b9b601d9a7dcde4897fe7b7a007") {
   var objectID = body.buyer_name;
   var txn_id = body.txn_id;
   var status = "";

   console.log(req.body);
   if (parseInt(body.status) < 0) {
      status = "Error";
      var exchangeError2 = exchangeError.replace(/{{email}}/g,email);
      var exchangeError3 = exchangeError2.replace(/{{VIEWTRANSACTION}}/g,"https://larecoin.github.io/");
      var exchangeError4 = exchangeError3.replace(/{{COIN1}}/g, body.currency2);
      var exchangeError5 = exchangeError4.replace(/{{COIN2}}/g, "LARE");
      var exchangeError6 = exchangeError5.replace(/{{DETAILS}}/g, body.status_text);
      ses.send({
      from: "Larecoin <support@larecoin.com>",
        to: [email],
        replyTo: ["support@larecoin.com"],
        subject: "Your Transaction Failed.",
        body: {
            text: 'Sent by https://www.larecoin.com',
            html: exchangeError6
        }
      },function(err,data){
        if (err) {
          res.error(err);
        } else {
          //res.success(data);
        }
      });
   } else if (parseInt(body.status) > 0 && parseInt(body.status) < 99) {
    status = "Pending";
   } else if (parseInt(body.status) >= 100) {
      status = "Complete";

      var exchangeSuccess2 =  exchangeSuccess.replace(/{{email}}/g,email);
      var exchangeSuccess3 =  exchangeSuccess2.replace(/{{VIEWTRANSACTION}}/g,"https://larecoin.github.io/");
      var exchangeSuccess4 =  exchangeSuccess3.replace(/{{LAREAMOUNT}}/g, totalLare);
      ses.send({
      from: "Larecoin <support@larecoin.com>",
        to: [email],
        replyTo: ["support@larecoin.com"],
        subject: "Your Transaction is Complete!",
        body: {
            text: 'Sent by https://www.larecoin.com',
            html: exchangeSuccess4
        }
      },function(err,data){
        if (err) {
          res.error(err);
        } else {
          res.success(data);
        }
      });
   }
     if (status == "") {
      status = "Open";
     }
      var userPointer = {
        "__type": 'Pointer',
        "className": '_User',
        "objectId":  objectID
      }
      var Transactions = Parse.Object.extend("Transactions");
      var query = new Parse.Query(Transactions);
      query.equalTo("userId", userPointer);
      query.equalTo("txn_id", txn_id);
      query.first({
        success: function(data) {
          console.log('found');
          data.set("status", status);
          data.set("Details", body.status_text);
          data.set("cpFee", body.fee);
          data.save(null,{useMasterKey:true}, {
            success: function(gameScore) {
              res.success('complete');
            }, error:function(err){
              console.log(err)
              res.error('err');
            }
          });
        },
        error: function(error) {
         console.log(error)
         res.error('error');
        }
      });
      console.log('savedStatuses');
      if (status == "Complete") {
        console.log('complete');
        var _User = Parse.Object.extend("_User");
        var query = new Parse.Query(_User);
        query.equalTo("objectId", objectID);
        query.first({
          success: function(userData) {
              var oldData = parseFloat(userData.get('totalLare')) + parseFloat(totalLare);
              var Referrals = Parse.Object.extend("Referrals");
              var ReferralsQ = new Parse.Query(Referrals);
              ReferralsQ.equalTo("userReferred", userPointer);
              ReferralsQ.equalTo("active", true);
              ReferralsQ.first({
                success: function(data123) {
                  console.log('found referralData');
                  var dollarAmount = 1.74735 * 100;
                  var rewardAmount = 17.4735;
                  if (oldData >= dollarAmount) {
                      var config = Parse.Object.extend("config");
                      var query = new Parse.Query(config);
                      query.get("k7t0S4tWWZ", {
                        success: function(ob) {
                          var data = ob.get('totalLare');
                          var newData = parseFloat(data) + rewardAmount;
                          obj.set('totalLare',newData.toString());
                          obj.save();
                          res.success('complete');
                        },
                        error: function(object, error) {
                          res.error('error');
                        }
                      });
                      data123.set("totalRewarded", rewardAmount.toString());
                      data123.set("active", false);
                      data123.save(null,{useMasterKey:true}, {
                        success: function(successDone) {
                          console.log('complete');
                          res.success('complete');
                        }, error:function(err){
                          console.log(err)
                          res.error('err');
                        }
                      });
                      console.log('saved referralData');
                  }
              },
              error: function(error) {
               console.log(error)
               res.error('error');
              }
            });

              var config = Parse.Object.extend("config");
              var query = new Parse.Query(config);
              query.get("k7t0S4tWWZ", {
                success: function(ob) {
                  var data = ob.get('totalLare');
                  var newData = parseFloat(data) - parseFloat(userData.get('totalLare'));
                  var brandNew = parseFloat(newData) + oldData;
                  obj.set('totalLare',brandNew.toString());
                  obj.save();
                  res.success('complete');
                },
                error: function(object, error) {
                  res.error('error');
                }
              });

            userData.set("totalLare", oldData.toString());
            userData.save(null,{useMasterKey:true}, {
              success: function(successDone) {
                console.log('complete')
                res.success('complete');
              }, error:function(err){
                console.log(err)
                res.error(error);
              }
            });
            console.log('saved user info reward');
        },
        error: function(error) {
         console.log(error)
         res.error(error);
        }
      });
      }
  }
   res.status(200).send('Done');
});


// { ipn_version: '1.0',
//     ipn_id: 'b01107d01aec1f35d0f704616bc1171f',
//     ipn_mode: 'hmac',
//     merchant: '2d657b9b601d9a7dcde4897fe7b7a007',
//     ipn_type: 'api',
//     status: '-1',
//     currency2: 'BCH',
//     txn_id: 'CPCC4HCSH1DXS2F6TQNXOK5PYW',
//     status_text: 'Cancelled / Timed Out',
//     currency1: 'USD',
//     fee: '2.0E-5',
//     custom: 'CUSTOM FIELD IS HERE RIGHT NOW FOR TEST',
//     amount2: '0.00465521',
//     buyer_name: 'obTOBMOHTY',
//     received_amount: '0',
//     amount1: '5',
//     received_confirms: '0'
// }






app.get('/test', function(req, res) {
  res.redirect('https://larecoin.com');
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

























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
"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
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
"                     <img src='https://larecoin.github.io/images/logoGray.png' width='100' height='auto' alt='Larecoin' border='0' style='color: #c60920; font-size: 15px; line-height: 20px; font-family: Arial, sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-interpolation-mode: bicubic;'>"+
"                     </a>"+
"                  </td>"+
"               </tr>"+
"            </tbody>"+
"         </table>"+
"      </center>"+
"   </body>"+
"</html>";



