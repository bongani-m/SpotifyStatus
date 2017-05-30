// loads env values
require('dotenv').config();
const {CLIENT_ID_SLACK, CLIENT_SECRET_SLACK,CLIENT_ID_SPOTIFY, CLIENT_SECRET_SPOTIFY, PORT} = process.env,
      SlackStrategy = require('passport-slack').Strategy,
      SpotifyStrategy = require('passport-spotify').Strategy,
      passport = require('passport'),
      request = require('request'),
      refresh = require('passport-oauth2-refresh'),
      express = require('express'),
      schedule = require('node-schedule'),
      filter = require('leo-profanity'),
      bodyParser = require('body-parser'),
      PouchDB = require('pouchdb'),
      cors = require('cors'),
      session = require('express-session'),
      app = express();

// Set Up
app.use(express.static(__dirname + 'client/build'));
app.use('/db', require('express-pouchdb')(PouchDB));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(session({secret: 'ssshhhhh'}));

var db = new PouchDB('spotifystatus');
var sess;
// Auth Set Up
var stategySlack = new SlackStrategy({
    clientID: CLIENT_ID_SLACK,
    clientSecret: CLIENT_SECRET_SLACK,
    scope: [ 'users.profile:write']
  }, (accessToken, refreshToken, profile, done) => {
    var slack = {
            name: profile.user.name, 
            email: profile.user.email,
            slack: {
              userId: profile.user.id,
              accessToken: accessToken,
              refreshToken: refreshToken
            }
      };
    done(null, slack);
  }
);
passport.use(stategySlack);
refresh.use(stategySlack);

var strategySpotify = new SpotifyStrategy({
    clientID: CLIENT_ID_SPOTIFY,
    clientSecret: CLIENT_SECRET_SPOTIFY,
    callbackURL: "https://spotifystatus.herokuapp.com/auth/spotify/callback"
  },
  function(accessToken, refreshToken, profile, done) {
   var spotify = {
            userId: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    done(null, spotify);
  }
);
passport.use(strategySpotify);
refresh.use(strategySpotify);


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(passport.initialize());


// path to start the OAuth flow
app.get('/auth/slack', passport.authorize('slack'));
app.get('/auth/spotify', passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private','user-read-playback-state'],
  session: false }));

// OAuth callback url
app.get('/auth/slack/callback', 
  passport.authorize('slack', { failureRedirect: '/login' }),
  (req, res) => {
    sess = req.session;
    sess.user = req.account;
    res.redirect("/");
});

app.get("/start", (req, res) => {
  sess = req.session;
    var user = sess.user;
    db.post(user)
      .then((result) => {
      user._id = result.id;
    })
    .catch((err)=>{
      console.log(">> ERROR>>>>>>>>>>", err);
    });
    res.json(user);
})

app.get('/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    sess = req.session;
    sess.user.spotify = req.user;
    res.redirect("/");
  });

function scheduleRefresh(user) {
      var rule = new schedule.RecurrenceRule();
      rule.second = 1;
      refresh.requestNewAccessToken('spotify', user.doc.spotify.refreshToken, (err, accessToken, refreshToken) => {
        user.doc.spotify.accessToken = accessToken;
        db.put(user.doc);
      });
      var j = schedule.scheduleJob(rule, function(){
        request.post({url:'https://spotifystatus.herokuapp.com:3001/update', json: user.doc});
      });
}

  app.get('/cron', (req,res) => {
      db.allDocs({include_docs: true})
        .then((users) => {
          users.rows.forEach(scheduleRefresh);
        })
        .catch((err) => {console.log(err)});
        

      res.json({time: Date.now(), task: 'done'});
      
  });



  app.post('/update', (req, res) => {
    
      var user = req.body;
      var headers = {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + user.spotify.accessTokenSpotify
      };

      var options = {
          url: 'https://api.spotify.com/v1/me/player',
          headers: headers
      };

      function callback(error, response, body) {
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
    
  })

console.log("ruuning on port:", PORT);
app.listen(PORT);


