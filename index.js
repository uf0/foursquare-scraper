var fs = require('fs');

var secret = JSON.parse(fs.readFileSync('data/secret.json', encoding='utf8')); 

var foursquare = (require('foursquarevenues'))(secret.CLIENT_ID, secret.CLIENT_SECRET);

var params = [{
    "intent": "browse",
    "limit" : 50,
    "sw":"52.34389,4.89724",
    "ne": "52.37355,4.92476"
}];

var finalParams = []

function squaring(params, callback){
  var paramsTotal = params.length,
      paramsParsed = 0,
      toSquaring = [];

  params.forEach(function(d){

    foursquare.getVenues(d, function(error, data) {
        if (!error) {
          if(data.response.venues.length > 45){
            
            var sw = d.sw.split(","),
                ne = d.ne.split(",");

            var diffLat = (parseFloat(ne[0]) - parseFloat(sw[0]))/2,
                diffLng = (parseFloat(ne[1]) - parseFloat(sw[1]))/2;

            // calculate the new bounding boxes
            var newLat = parseFloat(sw[0]) + diffLat,
                newLng = parseFloat(sw[1]) + diffLng;

            toSquaring.push({"sw": newLat + "," + sw[1], "ne": ne[0] + "," + newLng,"intent": "browse","limit" : 50})
            toSquaring.push({"sw":newLat + "," + newLng,"ne": ne[0] + "," + ne[1],"intent": "browse","limit" : 50})
            toSquaring.push({"sw":sw[0] + "," + sw[1], "ne": newLat + "," + newLng,"intent": "browse","limit" : 50})
            toSquaring.push({"sw":sw[0] + "," + newLng, "ne": newLat + "," + ne[1],"intent": "browse","limit" : 50})

          }else{
            finalParams.push(d)
          }
          paramsParsed++
          if(paramsParsed == paramsTotal){
            if(toSquaring.length){
              squaring(toSquaring)
            }else{
              callback(finalParams)
            }
          }
        }else{
          callback(error)
        }
    });

  })

}

squaring(params, function(data){
  fs.writeFile("data/grid.json", JSON.stringify(data, null, 2), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("The file was saved!");
    }
  });    
})
