import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fetch = require('node-fetch');
const baseUrl = 'https://helium-api.stakejoy.com/v1/hotspots/11BG2B1JMTyTTYQvcsoBHsTBvYAkQpYajmitAXPQwCvm8pPqo6F/roles';
const MAX_ATTEMPTS = 4;
var order = ['1st', '2nd', '3rd', '4th', 'Last attempt'];
//?cursor=eyJ0eXBlcyI6WyJjb2luYmFzZV92MSIsInNlY3VyaXR5X2NvaW5iYXNlX3YxIiwib3VpX3YxIiwic3RhdGVfY2hhbm5lbF9vcGVuX3YxIiwic3RhdGVfY2hhbm5lbF9jbG9zZV92MSIsImdlbl9nYXRld2F5X3YxIiwicm91dGluZ192MSIsInBheW1lbnRfdjEiLCJzZWN1cml0eV9leGNoYW5nZV92MSIsImNvbnNlbnN1c19ncm91cF92MSIsImFkZF9nYXRld2F5X3YxIiwiYXNzZXJ0X2xvY2F0aW9uX3YxIiwiYXNzZXJ0X2xvY2F0aW9uX3YyIiwiY3JlYXRlX2h0bGNfdjEiLCJyZWRlZW1faHRsY192MSIsInBvY19yZXF1ZXN0X3YxIiwicG9jX3JlY2VpcHRzX3YxIiwidmFyc192MSIsInJld2FyZHNfdjEiLCJyZXdhcmRzX3YyIiwidG9rZW5fYnVybl92MSIsImRjX2NvaW5iYXNlX3YxIiwidG9rZW5fYnVybl9leGNoYW5nZV9yYXRlX3YxIiwicGF5bWVudF92MiIsInByaWNlX29yYWNsZV92MSIsInRyYW5zZmVyX2hvdHNwb3RfdjEiLCJ0cmFuc2Zlcl9ob3RzcG90X3YyIiwic3Rha2VfdmFsaWRhdG9yX3YxIiwidW5zdGFrZV92YWxpZGF0b3JfdjEiLCJ0cmFuc2Zlcl92YWxpZGF0b3Jfc3Rha2VfdjEiLCJ2YWxpZGF0b3JfaGVhcnRiZWF0X3YxIiwiY29uc2Vuc3VzX2dyb3VwX2ZhaWx1cmVfdjEiXSwibWluX2Jsb2NrIjoxMjA1OTA0LCJtYXhfYmxvY2siOjEyMjY0NDEsImJsb2NrIjoxMjI2NDAwLCJhbmNob3JfYmxvY2siOjEyMjY0MDB9

var http = require("http"),
port = 3000;

http.createServer(function(request, response) {


  let data = getData(baseUrl, 0, response);


}).listen(process.env.PORT || parseInt(port, 10));

console.log("file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");


function getData(url, attempt, response) {

  if (attempt == undefined )
    attempt = 0;
  if (attempt > MAX_ATTEMPTS) {
    return null;
  }

  console.log("fetching " + order[attempt] + "...");
  fetch(url, {
    method: 'get',
    headers: {'User-Agent': 'Mozilla/5.0'}
  })
    .then(response => response.text())
    .then(text => JSON.parse(text))
    .then(obj => {
      if (typeof obj.data !== 'undefined' && obj.data.length > 0) {
        console.log('retrieved data successfully\n');
        let reward = toLocalTime(findInArray(obj.data, "role", "reward_gateway")[0] ? findInArray(obj.data, "role", "reward_gateway")[0].time : '');
        let witness = toLocalTime(findInArray(obj.data, "role", "witness")[0] ? findInArray(obj.data, "role", "witness")[0].time : '');
        let challengee = toLocalTime(findInArray(obj.data, "role", "challengee")[0]? findInArray(obj.data, "role", "challengee")[0].time : '');
        let result = {
          "reward_gateway": reward,
          "wintness": witness,
          "challengee": challengee
        };

        console.log(result);
        response.writeHead(200);
        response.write("<html> <body> <pre style='font-size: large;'> <code>");
        response.write(JSON.stringify(result, undefined, 2));
        response.write(" </code></pre> </body> </html>");
        response.end();
      }
      else {
        getData(baseUrl + "?cursor=" + obj.cursor, attempt + 1, response);
      }
    })
    .catch(error => console.log(error));
}

function findInArray(arr, element_name, value){
  return arr.filter(function(item){
    return item[element_name] === value;
  })
}
function toLocalTime(timestamp){
  return new Date(timestamp*1000).toLocaleString() + " ("+ ((Date.now()-timestamp*1000)/3600000).toFixed(1) +" Hours)";
}


