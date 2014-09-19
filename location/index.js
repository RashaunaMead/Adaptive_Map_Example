var Location = function(){
	this.data = {
		id: null,
		lat: null,
		lon: null,
		time: null

	};
    // loops through every property in the instence to see if it matches a proprty to fill
    
	this.fill = function (info){
		for(var property in this.data){
			if(this.data[property] !== 'undefined'){
				this.data[property] = info[property];
			}
		}
	};

	this.triggerCheckIn = function(){
		this.data.checkIn = Date.now();
	};

	this.getInformation = function(){
		return this.data; 
	};

};
// makes new person, fills it and returns it
module.exports = function (info){
	var instance = new Location();
	console.log("new instance made ");
	instance.fill(info);
	return instance;
}