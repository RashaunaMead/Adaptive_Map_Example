/*
 * GET home page.
 */
//links to the schema for the db
var LocationSchema  = require('../schemas/location');

module.exports = function (){
	 var functions = { };

	//This is what stores the new infomation that comes in. 
	functions.locationSent = function(info){
		var locationInfo = info;
		console.log("function location sent called");
		console.log(info);
		//locations[locationInfo].triggerCheckIn();
		var record = new LocationSchema (
		{
		id: locationInfo.id,
		time: locationInfo.timeStamp,
		lat: locationInfo.lat,
		lng: locationInfo.lng,
		type: locationInfo.type,
		info: locationInfo.info
		}
		);

		record.save(function(err){
			if(err){
				console.log(err);
			}
		});
	};
	
	functions.typeQuery = function(type){
		LocationSchema.find()
		.where('type').equals(type)
		.sort('time')
		.exec(function(err, time){
			var typeInfo = JSON.stringify(time);
		});	
	}
		//array
		functions.typeQuery2 = function( type, callback){
		LocationSchema.find()
		.where('type').equals(type)
		.sort('time')
		.exec(function(err, time){
			//add err handling
			var typeInfo = JSON.stringify(time);
			callback(typeInfo);
		});	
	}

functions.typeQueryJson = function( type, callback){
	var features = [];
    var jsonSend = {"type": "FeatureCollection", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },"features": features};
		LocationSchema.find()
		.where('type').equals(type)
		.sort('time')
		.exec(function(err, time){
		
			for(location in time){
					var coords = [  time[location].lng, time[location].lat ];
				var eachOne = 
			      { "type": "Feature",
			        "geometry": {"type": "Point", "coordinates": coords},
			        "properties": {"id": time[location].id ,"type":time[location].type, "info" :time[location].info, "time" :time[location].time }
			      };
		       
				features.push(eachOne);
				}
		callback(jsonSend);
			
		});
				

		
	}
functions.dateQueryJson = function( date, date2, callback){
	var after =  new Date(date);
	var before = new Date(date2);
	var features = [];
    var jsonSend = {"type": "FeatureCollection", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },"features": features};
		LocationSchema.find({"date_created":{"$lt":before,"$gte":after}})
		.sort('time')
		.exec(function(err, time){
		
			for(location in time){
					var coords = [  time[location].lng, time[location].lat ];
				var eachOne = 
			      { "type": "Feature",
			        "geometry": {"type": "Point", "coordinates": coords},
			        "properties": {"id": time[location].id ,"type":time[location].type, "info" :time[location].info, "time" :time[location].time }
			      };
		       
				features.push(eachOne);
				}
				callback(jsonSend);
		});

		
	}

	
	functions.checkIns2 = function(req, res){
		LocationSchema.find()
		.where('type').equals('Strike')
		.sort("type")
		.exec(function(err, time){
			if(err){
				res.status(500).json({status: 'failure'});
			}
			else{
				res.render('checkIns2',{
					title: "checkins 2",
					time : time
				})
			}
		});

	};

	functions.checkIns2x = function(req, res, id){
		LocationSchema.find()
		.sort("type")
		.exec(function(err, time){
			if(err){
				res.status(500).json({status: 'failure'});
			}
			else{
				res.redirect('checkIns2',{
					title: "time",
					time : time
				})
			}
		});
	}

	functions.getGeoJsonFromMongo = function(callback){
		

		var features = [];
       	var jsonStart = {"type": "FeatureCollection", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },"features": features};
       	LocationSchema.find()
		.exec(function(err, time){
			if(err){
				res.status(500).json({status: 'failure'});
			}
			else{

				for(location in time){
					var coords = [  time[location].lng, time[location].lat ];
				var eachOne = 
			      { "type": "Feature",
			        "geometry": {"type": "Point", "coordinates": coords},
			        "properties": {"id": time[location].id ,"type":time[location].type, "info" :time[location].info, "time" :time[location].time }
			      };
		       
					features.push(eachOne);
				}
				callback(jsonStart);

			}
		});
		
	}



	functions.sendCoordsInfo = function(req, res){
	
		LocationSchema.find()
		.sort("type")
		.exec(function(err, time){
			if(err){
				res.status(500).json({status: 'failure'});
			}
			else{
				var maxNumber = 1;
				var dataNumbers = [];
				for(location in time){
					var eachLocation = {lat: time[location].lat, lng: time[location].lng, type: time[location].type, info: time[location].info};
					dataObj.push(eachLocation);	
				}
			}
		});
		
		return dataObj;	
	};
	

	return functions;
};
