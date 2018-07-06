var AmazonS3 = require('../../node_modules/aws-sdk');
var AmazonSES = require('../../node_modules/amazon-ses-mailer');
var ses = new AmazonSES('AKIAIXOSOWERN7J62PUA', 'yi4O3Nf3YslNjBSngX7ytTNa4w+2qnDL+5e39qYR', 'us-east-1');

var XMLHttpRequest = require("../../node_modules/xmlhttprequest").XMLHttpRequest;


Parse.Cloud.define('webCrawler', function(request, response) {
  var url = request.params.url;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    	response.success(this.responseText);
    } else {
    	response.error(JSON.stringify(this));
    }
  };
  xhttp.open("GET", url, false);
  //xhttp.setRequestHeader("Authorization", "Basic ODNmNzc4ZTJiZTVmZTU4MTYzOWQ0NTdjNDQ1NDY4YzM6N2RjOGI3NWIxYTczMjRkN2QyOThmN2Y2YTY0ODdlNDQ=");
  xhttp.send();
});
