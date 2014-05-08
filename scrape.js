var fs = require('fs');

var secret = JSON.parse(fs.readFileSync('data/secret.json', encoding='utf8')); 
var grid = JSON.parse(fs.readFileSync('data/grid.json', encoding='utf8')); 

var foursquare = (require('foursquarevenues'))(secret.CLIENT_ID, secret.CLIENT_SECRET);


function scraping(params, callback){
  var paramsTotal = params.length,
      paramsParsed = 0,
      venues = [];

  params.forEach(function(d,i){

    foursquare.getVenues(d, function(error, data) {
        if (!error) {
          venues = venues.concat(data.response.venues)
          console.log(i + "/" + paramsTotal)
          paramsParsed++
          if(paramsParsed == paramsTotal){
            callback(venues)
          }
        }else{
          callback(error)
        }
    });

  })

}

scraping(grid, function(data){
  fs.writeFile("data/outtest.json", JSON.stringify(data, null, 2), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("The file was saved!");
    }
  });    
})
