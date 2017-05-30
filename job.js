// loads env values
require('dotenv').config();
const  {PORTALT} = process.env,
      request = require('request'),
      filter = require('leo-profanity'),
      bodyParser = require('body-parser'),
      express = require('express'),
      app = express();

// Set Up
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


  app.post('/update', (req, res) => {
      
      var user = req.body;
      var headers = {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + user.spotify.accessToken
      };

      var options = {
          url: 'https://api.spotify.com/v1/me/player',
          headers: headers
      };

      function callback(error, response, body) {
          if(error){
              console.log(error);
          }
          if (!error && response.statusCode == 200) {
              var data = JSON.parse(body);
              var status_text = "I'm playing '" + filter.clean(data.item.name) + "' by " + data.item.artists[0].name;    
              var status = {
                  "status_text": status_text,
                  "status_emoji": ":spotify:"
              };
          
              var uriEncoded = encodeURIComponent(JSON.stringify(status));
              var url = `https://slack.com/api/users.profile.set?token=` + user.slack.accessToken + `&profile=` + uriEncoded;
              request.post(url,(err, code, body) => {console.log(err)});
          }
      }
      request(options, callback);
      res.json({code: 200,res: "OK"});
    
  })

console.log("ruuning on port:", PORTALT);
app.listen(PORTALT);


