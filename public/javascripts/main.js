$(document).ready(function(){  

	var protestJson = [];
	var markersInfo = [];
	var markerOn =false;
	var markerSend;
	var features = [];
	var mobileView = false;
	var markersOn= false;
	var featureLayer;

	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			mobileView = true;
			$('.forDesk').hide();
			$('.addMarker').show();
			$('#useLocMobile').hide();
			$('#mainOpen').show();
			$('.addProtestDiv').addClass('active');
			$('.addQueryDiv').removeClass('active');
			$("#addProtestForm").show();
			$('.desktop').hide();
			$('.removeMobile').hide();
		}
	else{
			mobileView = false;
			$('.forMobile').hide();
			$('.addQueryDiv').addClass('active');
			$('.addProtestDiv').removeClass('active');
			$("#queryProtest").show();
			$('.addQueryDiv').show();
			$('.hideDesk').hide();
			$('#mainDesk').hide();
			$('#mainOpen').hide();
		}

	//starts the data fun
	var socket = io.connect(window.location.hostname);
	socket.emit('GetCoords');
	socket.on('connect', function () { 	
		socket.on('dataSending', function(data){
			protestJson.push(data);
			loadMap();
		});
	});

	// shows when other window is updating map
	socket.on('newDataFromSocketsComming', function(){
		protestJson.data = [];
	});

	// assigns unique session id and stores it
	socket.on('sessionIds', function(session){
			id = session.id;
	});

	//Loads the map
	function loadMap() {
		var drawControls = false;
		var type;
		var info = ' ';
	  	var markerPlaced=false;
	  	var marker;
	  	var markerCoords = [];

	  	//heat layer info
	  	var heatLayerSpecs = {
	    	max: 1,
	    	maxZoom: 4,
	    	radius: 20, 
	    	blur: 15,
	    	absolute:true 
	    };
	    var drawControl;
	    var drawOn= false;

	    var lat = 0.495563;
	    var lng = -10.492188;
	    var zoomSet = 2;
	    var firstTime = true;

	    //my token stored in maptoken.js
	 	L.mapbox.accessToken = mapboxToken;
		var map = L.mapbox.map('map',null,{ zoomControl: false });

		var stamenLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
	 	 attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a> Icons by the Noun Project -  World by Mateo Zlatar - Map Marker by Jardson A.'
		}).addTo(map);

		map.setView([lat, lng], zoomSet);

	    var heat = L.heatLayer([], heatLayerSpecs).addTo(map);
		var myLayer = L.mapbox.featureLayer();

		// set the zoom to the right and not left
		new L.Control.Zoom({ position: 'topright' }).addTo(map);

		// Adds initial heatmap with all the protests
		myLayer.on('layeradd', function(e) {
		        heat.addLatLng(e.layer._latlng);
		});

		// sets the initial Json from onload call
		myLayer.setGeoJSON(protestJson);
		markersInfo = protestJson;
		map.setMaxBounds([[-84, 174], [84, -174]]);

		// Responsive Changes based on mobile or not
	    if(mobileView==true){
	    	$('.leaflet-control-zoom').remove();
	    	zoomSet=12;
	    	setCurrentLocationMobile();
	    }
	    else{
	    	queryType('all');
	    }

	    //jQuery click function calls

	    //if the user wants to add a protest
		$('.addProtestDiv').click(function(){
			$("#addProtestForm").show();
			$("#queryProtest").hide();
			$(this).addClass('active');
			$('.addQueryDiv').css('background-color','none');
			removeDraw();
			queryType('all');
			$('.addQueryDiv').removeClass('active');
		});

		//if the user wants to query the protests
		$('.addQueryDiv').click(function(){
			$(this).addClass('active');
			$("#queryProtest").show();
			$("#addProtestForm").hide();
			$('.addProtestDiv').css('background-color','none');
			$('.addProtestDiv').removeClass('active');
			queryType('all');
		});

		//if  close ui is clicked
		$('#mainClose').click(function(){
			$('#mainClose').hide();
			$('#change').hide();
			$('#mainOpen').show();

		});

		//if  open ui is clicked
		$('#mainOpen').click(function(){
			$('#mainOpen').hide();
			$('#change').show();
			if( mobileView==true ){
				$('#mainClose').show();
				$('#mainDesk').hide();
			}
			// else{
			// 	$('#map').css('margin-left','350px').css('width','calc(100% - 350px)');
			// }
		});

		//if desktop is clicked to close
		$('#mainDesk').click(function(){
			$('#change').hide();
			$('#mainOpen').show();
			// if(mobileView ==false){
			// 	$('#map').css('margin-left','0px').css('width','100%');
			// }
		})

		// Marker function for adding location to map
		function makeMarker(lat, lng){
			markerPlaced=true;
			 marker = L.marker(new L.LatLng(lat, lng), {
		        icon: L.mapbox.marker.icon({'marker-color': 'D43B24'}),
		        draggable: true
		 	});

			marker.bindPopup('Drag this marker to the the protest location');
			marker.addTo(map);
			marker.on('dragend', function(event){
			    var position = marker.getLatLng();
			    markerCoords = [marker._latlng.lat, marker._latlng.lng];
			    map.setView([marker._latlng.lat, marker._latlng.lng]);
			});
			markerCoords = [marker._latlng.lat, marker._latlng.lng];
			marker.openPopup();
			map.setView([marker._latlng.lat, marker._latlng.lng],14);
		}

		//zoomlevel Report 
		map.on('zoomend',function(){
		$('#zoomLevel h5').html("zoom: <span class='redZoom'>" + map.getZoom() + "</span>");
		})

		//sets it for the first time
		$('#zoomLevel h5').html("zoom: <span class='redZoom'>" + map.getZoom() + "</span>");

		// adds users location to map
		$('.myLocation').click(function () {
			$(this).addClass('active');
			$('.addMarker').removeClass('active');
			if(markerPlaced===true){
				map.removeLayer(marker);
			}
			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(showPosition);
			}
			else{
				alert("Geolocation is not supported by this browser.");
			}

			function showPosition(pos){
				var lat = pos.coords.latitude;
				var lng = pos.coords.longitude;
				var time = new Date();
				var timeStamp = time.getTime();
				makeMarker(lat,lng);
			}
		});

		//if a protest is added using the mobile view
		$('.mobileAdd').click(function () {
			$(this).addClass('active');
			$('#useLocMobile').show();
			$('#change').hide();
			$('#mainOpen').show();
			if(markerPlaced===true){
				map.removeLayer(marker);
			}
			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(showPosition);
			}
			else{
				//alert("Geolocation is not supported by this browser.");
			}
			function showPosition(pos){
			var lat = pos.coords.latitude;
			var lng = pos.coords.longitude;
			var time = new Date();
			var timeStamp = time.getTime();
			makeMarker(lat,lng);
		}
		});

		$('.setLocationMobile').click(function(){

		});

		//sets the current location
		function setCurrentLocation (){
			$(this).addClass('active');
			$('.addMarker').removeClass('active');
			if(markerPlaced===true){
				map.removeLayer(marker);
			}
			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(showPosition);
			}
			else{
				alert("Geolocation is not supported by this browser.");
			}

			function showPosition(pos){
				var lat = pos.coords.latitude;
				var lng = pos.coords.longitude;
				var time = new Date();
				var timeStamp = time.getTime();
				makeMarker(lat,lng);
				return [lat,lng]
			}
		}

		function setCurrentLocationMobile (){

			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(showPosition);
			}
			else{
				alert("Geolocation is not supported by this browser.");
			}

			function showPosition(pos){
				var lat = pos.coords.latitude;
				var lng = pos.coords.longitude;
				map.setView([lat, lng],14);
				return [lat,lng]
			}
		}

		// If user wants to place marker by hand
		$('.addMarker').click(function(){
			$(this).addClass('active');
			$('.myLocation').removeClass('active');
			//use 12 for zoom level once finished adding beta info
			// insures that the user is zoomed in enough to see streets before 
			// placing the marker
			if(map.getZoom()>13){
				$('.myLocation').css("background-color","none");
				if(markerPlaced==true){
				map.removeLayer(marker);
				}
				var latlng = map.getCenter();
				makeMarker(latlng.lat,latlng.lng)
			}
			//if not zoomed in enough it will alert the user to zoom in futher
			else{
				//this can be changed to a pop up later
				// to prevent someone from choosing a location from a zoom
				// level that doesn't make sense
				alert('You need to be zoomed in to a level of 14 or higher to place a marker');
			}
		});

		// jQuery for type of protest selections
		$('.boycott').click(function(){
			type='Boycott';
			$(this).addClass('active');
			$('.strike, .protest, .other').css("background-color","none");
			$('.strike, .protest, .other').removeClass('active');
		});

		$('.strike').click(function(){
			type='Strike';
			$(this).addClass('active');
			$('.boycott, .protest, .other').css("background-color","none");
			$('.boycott, .protest, .other').removeClass('active');


		});
		$('.protest').click(function(){
			type='Protest';
			$(this).addClass('active');
			$('.strike, .boycott, .other').css("background-color","none");
			$('.strike, .boycott, .other').removeClass('active');

		});
		$('.other').click(function(){
			type='Other';
			$(this).addClass('active');
			$('.strike, .protest, .boycott').css("background-color","none");
			$('.strike, .protest, .boycott').removeClass('active');
		});

		// for text area where user writes about the protest
	    document.getElementById("textInfo").value='';
		
		//Submits the new protest to the database after error checking
		$('.submitCoords').click(function(){
			//console.log(marker._latlng.lat);
			info = document.getElementById("textInfo").value;
			// Error handeling makes sure user filled in enough info
			if(marker===undefined & type ===undefined){
				//alert("add marker and type of protest");
			}
			else if(marker===undefined){
				//alert("add marker");
			}
			else if(type ===undefined){
				//alert("add type");
			}
			else{
				if (document.getElementById("textInfo").value == ''){
					info = document.getElementById("textInfo").value = 'none provided';
				}
				else{
					info=document.getElementById("textInfo").value;
				}
				submitProtest(marker._latlng.lat,marker._latlng.lng,type,info);
			}
			//if a marker has already been used then remove it
			if(markerPlaced==true){
				map.removeLayer(marker);
				$('#useLocMobile').hide();
				$('.confirm p').html("Your Protest Has been added").fadeOut(5000);
				queryType('all');
			}	
		})

		// Sends the protest in
		function submitProtest(lat,lng,type,info){
			//alert("Thank you your infomation has been added!");
			var time = new Date();
			var timeStamp = time.getTime();
			socket.emit('locationSend', {id: id, timeStamp: timeStamp, lat: lat, lng: lng, type: type, info: info});
		}
		
		//jQuery for type query
		$('.boycottQ').click(function(){
			$(this).addClass('active');
			$('.strikeQ, .protestQ, .otherQ, .allQ, .otherQ, .findDate , .withinShape').removeClass('active');
			myLayer.clearLayers();
			map.removeLayer(heat);
			queryType('Boycott');
			removeDraw();
		});

		$('.strikeQ').click(function(){
			$(this).addClass('active');
			$('.boycottQ, .protestQ, .otherQ, .allQ, .otherQ, .findDate , .withinShape').removeClass('active');
			myLayer.clearLayers();
			map.removeLayer(heat);
			queryType('Strike');
			removeDraw();
		});

		$('.protestQ').click(function(){
			$(this).addClass('active');
			$('.boycottQ, .strikeQ, .otherQ, .allQ, .otherQ, .findDate , .withinShape').removeClass('active');
			myLayer.clearLayers();
			map.removeLayer(heat);
			queryType('Protest');
			removeDraw();
		});

		$('.otherQ').click(function(){
			$(this).addClass('active');
			$('.boycottQ, .strikeQ, .protestQ, .allQ, .otherQ, .findDate , .withinShape').removeClass('active');
			myLayer.clearLayers();
			map.removeLayer(heat);
			queryType('Other');
			removeDraw();

		});

		$('.allQ').click(function(){
			$(this).addClass('active');
			$('.boycottQ, .strikeQ, .protestQ, .otherQ, .findDate , .withinShape').removeClass('active');
			myLayer.clearLayers();
			map.removeLayer(heat);
			queryType('all');
			removeDraw();
		});

		//Queries by type of protest 
		function queryType(type){
			clearList();
			markersInfo = [];
			var typeJson = protestJson;
			if(type != 'all'){
				socket.emit('queryType', type);
				socket.on('queryReturned', function(data){
					socket.removeAllListeners("queryReturned");
					myLayer.clearLayers();
					map.removeLayer(heat);
					heat = L.heatLayer([], heatLayerSpecs);
					heat.addTo(map);	
					typeJson = data;
				myLayer.setGeoJSON(typeJson);
				markersInfo= typeJson;
				updateMarkersInfo();
				});
			}
			else{
				socket.emit('GetCoordsAll', type);
				socket.on('dataSendingTypeAll', function(data){
					socket.removeAllListeners("dataSendingTypeAll");
					myLayer.clearLayers();
					map.removeLayer(heat);
					heat = L.heatLayer([], heatLayerSpecs);
					heat.addTo(map);
					typeJson = data;
					myLayer.setGeoJSON(typeJson);
					markersInfo= typeJson;
					if(firstTime==false){
						updateMarkersInfo();
					}
					else{
						firstTime = false;
					}
				});
			}
			// Sets feature layer for within shape queiries
			myLayer = L.mapbox.featureLayer();
			myLayer.on('layeradd', function(e) {
				makeList(e.layer.feature.properties.type,e.layer.feature.properties.time,e.layer.feature.properties.info);
				heat.addLatLng(e.layer._latlng);
			});
		}
		// Sets feature Group for draw controls
		var  featureGroup = L.featureGroup().addTo(map);
			drawControl = new L.Control.Draw({
			position: 'topright',
			draw: {
				polyline: false,
				marker: false,
				circle: false,
			},
			edit: {
			    featureGroup: featureGroup,
			    edit: false,
			    remove: false
			},
		});

		//Within shap quires for spatial quiries
		$('.withinShape').click(function(){
			queryType('all');
			$('.boycottQ, .findDate ,.strikeQ, .protestQ, .allQ, .otherQ').removeClass('active');
			$(this).addClass('active');
			var pointAdded = false;
			var lastShape;
			if(drawControls==false){
				featureGroup = L.featureGroup().addTo(map);
				addDraw();
			 	map.on('draw:created', function(e) {
			 		clearList();
			 		if(pointAdded==false){
			 			pointAdded=true;
			 		}
			 		else{
			 			featureGroup.removeLayer(featureGroup._layers[lastShape]);
			 		}
			 		featureGroup.addLayer(e.layer);
			 		lastShape = e.layer._leaflet_id;
			 		var coordsObj = e.layer.getLatLngs();
			 		var coords = [];
			 		for( var i=0; i < coordsObj.length; i++ ){
//			 			console.log(coordsObj[i].lat);
			 			coords.push([coordsObj[i].lng,coordsObj[i].lat]);
			 		}		 		
			 		var geojson ={
					  "type": "Feature",
					  "geometry": {
					    "type": "Polygon",
					    "coordinates": [coords]
					  },
					  "properties": {
					    "name": "lastShape"
					  }
					};
			 		var sendShape = L.geoJson(geojson);
			 		queryShape(sendShape);
			  	});
			}
		});
		//Removes shape and resets query
		$('.removeShape').click(function(){
			queryType('all');
			removeDraw();

		})	

		//Removes the draw control
		function removeDraw(){
		  	if(drawOn==true){
		  		drawControl.removeFrom(map);
		  		map.removeLayer(featureGroup);
		  		drawOn=false;
		  	}
		}

		// Adds the contorls for draw
	  	function addDraw(){
	  		if(drawOn==false){
	  			drawControl.addTo(map);
	  			drawOn=true;
	  		}
	  	}
	  	// Checks to see if the points are within the shap
	  	function queryShape(geoJsonShape){
		  	var protestsFound = [];
		  	markersInfo = [];
		  	map.removeLayer(heat);
			heat = L.heatLayer([], heatLayerSpecs).addTo(map);
			var myLayer = L.mapbox.featureLayer();
			//console.log(protestJson[0].features.length);
			var length = protestJson[0].features.length;
			var count = 1;
			myLayer.on('layeradd', function(e) {
				count++;
				//console.log(protestJson[0].features.length);
				var layer = leafletPip.pointInLayer( e.layer.getLatLng(), geoJsonShape, true);
			  	if(layer[0]!=undefined){
					heat.addLatLng(e.layer._latlng);

					makeList(e.layer.feature.properties.type,e.layer.feature.properties.time,e.layer.feature.properties.info);
					features.push(e.layer.feature);
					markersInfo.push(e.layer.feature);
			   }

			});
			myLayer.setGeoJSON(protestJson);
			updateMarkersInfo();

		}

		//Starts the calandar for date inputs
		$( "#datepicker" ).datepicker({
				inline: true
			});
		$( "#datepickerEnd" ).datepicker({
				inline: true
			});
	//
		$(".last24").click(function(){
			$('.boycottQ, .strikeQ, .protestQ, .allQ, .otherQ').removeClass('active');
			$(this).addClass('active');
			var now = new Date($.now());
			var day = 86400000;
			var before24 = new Date($.now()-day)
			console.log(now);
			console.log(before24);

			queryDate(before24,now);
		});
		$(".lastWeek").click(function(){
			$('.boycottQ, .strikeQ, .protestQ, .allQ, .otherQ').removeClass('active');
			$(this).addClass('active');
			var now = new Date($.now());
			var week = 86400000*7;
			var before24 = new Date($.now()-week)
			console.log(now);
			console.log(before24);

			queryDate(before24,now);
		});
		$(".allDays").click(function(){
			queryType('all');
		})
		// Sends selected dates to the database function
		$(".findDate").click(function(){
			$('.boycottQ, .strikeQ, .protestQ, .allQ, .otherQ').removeClass('active');
			$(this).addClass('active');
			var timeStart = document.getElementById("datepicker").value;
			var nowDate = $.now();
			nowDate = new Date(nowDate);
			console.log("now date "+ nowDate);
			timeStart = new Date(timeStart);				
			//queryDate(timeStart,timeEnd);
			removeDraw();
			var timeEnd = document.getElementById("datepickerEnd").value;
			timeEnd = new Date(timeEnd);
			queryDate(timeStart,timeEnd);
		})
		// sets lists at false
		var list = false;
		// clears list
		function clearList(){
			$('.List ul').html(" ");
			if(list===true){
				$("#List ul li").remove();
			}
			markersInfo = [];
		}
		// sets lists of protests
		function makeList(type, time, info){
			//$('.List ul').html(" ");
			//console.log(list + "given");
			if(list===true){
			//$("#List ul li").parent().remove();
			
			}
			//console.log(time);
			time = new Date(time) 
			$(".List ul").append("<li><span class='red'><b>" + type +"</b></span> </br>"+ time +"</br><span class='red'>Infomation: </span>"+ info+"</li>");
			var converted = (time.getMonth()+1);
			// converted = converted.replace("/", "");
			// 		converted = converted.replace("/", "");

			//console.log(converted);
			list = true;
		}
		// the function that sends the dates to the backend
		function queryDate (startDate ,endDate){
			clearList();
			var typeJson = protestJson;
			var myLayer = L.mapbox.featureLayer();
			socket.emit('queryDate', startDate, endDate);
			socket.removeAllListeners("queryReturnedDate");
			socket.on('queryReturnedDate', function(date){
				console.log(date);
				//markersInfo = date;
				myLayer.clearLayers();
				map.removeLayer(heat);
				heat = L.heatLayer([], heatLayerSpecs);
				heat.addTo(map);
				dateJson = date;
				myLayer.setGeoJSON(dateJson);
				markersInfo.push(dateJson);
				updateMarkersInfo();		
				

			});//end socket
			
			myLayer.on('layeradd', function(e) {
			   //console.log(e.layer.feature.properties.type);

			   makeList(e.layer.feature.properties.type,e.layer.feature.properties.time,e.layer.feature.properties.info);
				heat.addLatLng(e.layer._latlng);

			});
			
		}

		//to toggle the markers, need to work on this
		$(".addMapMarkers").click(function(){
			if (markerOn==false){
				$(".addMapMarkers img").toggle();
				markerOn=true;
				updateMarkersInfo();
			}
			else {
				$(".addMapMarkers img").toggle();
			map.removeLayer(featureLayer);
			markerOn=false;

			}
		});
		// to update balloon info markers with queries 
		function updateMarkersInfo(){
		 if (markerOn==true){
				protestJson = markersInfo;
		    	featureLayer = map.featureLayer.setGeoJSON(protestJson);
				map.featureLayer.eachLayer(function(protestJson) {

			    var date = new Date(protestJson.feature.properties.time);
			    var content = "<p class='mobile info'> " + protestJson.feature.properties.info+"</p><p class='mobile type'>Type: "+protestJson.feature.properties.type+"</p><p class='mobile time'>"+date+"</p>";
			    protestJson.bindPopup(content);
			
				});

				
				map.addLayer(featureLayer);
			}
			 else{
			//map.remove(featureLayer);
			  
			

			 }
		}
		
		//ends load map function	


	 };

})
