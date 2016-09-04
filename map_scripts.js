var geocoder, map, markers = [];
var bounds = new google.maps.LatLngBounds();
var added_home_to_path = false;


function initialize() {
	geocoder = new google.maps.Geocoder();

	var mapProp = {
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"), mapProp);

	if(navigator.geolocation) {
   		browserSupportFlag = true;
   		navigator.geolocation.getCurrentPosition(function(position) {
     			initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
     			map.setCenter(initialLocation);
   		}, function() {
     			handleNoGeolocation(browserSupportFlag);
   		});
 	}
}


google.maps.event.addDomListener(window, 'load', initialize);


function set_marker(marker_position, address) {
	var marker = new google.maps.Marker({
		map: map,
		position: marker_position,
		title: (address == home) ? 'Home' : ('Destination ' + markers.length),
		animation: google.maps.Animation.DROP
	});
	markers.push(marker);
}


function code_address(address) {
	geocoder.geocode( {'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			set_marker(results[0].geometry.location, address);

			for (var i = 0; i < markers.length; i++) {
				bounds.extend(markers[i].getPosition());
			}

			map.fitBounds(bounds);

			if (map.getZoom() > 15) {
				map.setZoom(15);
			}

		}
		else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}


function draw_directions(start, end, waypoints) {
	var directions_service = new google.maps.DirectionsService;
	var directions_display = new google.maps.DirectionsRenderer({
		map: map,
		preserveViewport: true
	});

	directions_service.route({
		origin: start,
		destination: end,
		waypoints: waypoints,
		travelMode: google.maps.TravelMode.DRIVING
	}, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			var polyline = new google.maps.Polyline({
				path: [],
				strokeColor: "#1a8cff",
				strokeWeight: 3
			});
			var legs = response.routes[0].legs;
			for (var i = 0; i < legs.length; i++) {
				var steps = legs[i].steps;
				for (var j = 0; j < steps.length; j++) {
					var next_segment = steps[j].path;
					for (var k = 0; k < next_segment.length; k++) {
						polyline.getPath().push(next_segment[k]);
					}
				}
			}
			polyline.setMap(map);
		}
		else {
			alert('Directions request failed due to ' + status);
		}
	});
}


function distance_and_time(origin, destinations_copy, path, tot_distance) {
	console.log("Destinations Copy: " + destinations_copy);
	var distance_service = new google.maps.DistanceMatrixService;
	distance_service.getDistanceMatrix({
		origins: [origin],
		destinations: destinations_copy,
		travelMode: google.maps.TravelMode.DRIVING,
		unitSystem: google.maps.UnitSystem.IMPERIAL,
		avoidHighways: false,
		avoidTolls: false
	}, function(response, status) {
		var origins = response.originAddresses;
		var destinations = response.destinationAddresses;
		var distances = [], times = [];
		if (status == google.maps.DistanceMatrixStatus.OK) {
			for (var i = 0; i < origins.length; i++) {
				var results = response.rows[i].elements;
				for (var j = 0; j < results.length; j++) {
					var element = results[j];
					distances[j] = element.distance.text;
					distances[j] = distances[j].slice(0, -3);
					distances[j] = Number(remove_commas(distances[j]));
					console.log("Distances: " + distances);
					times[j] = element.duration.text;
				}
			}
			var min_distance, index, new_origin;
			[min_distance, index_of_min] = find_min(distances);
			path.push(destinations_copy[index_of_min]);
			console.log("Path: " + path);
			tot_distance += distances[index_of_min];
			console.log("Total Distance: " + tot_distance);
			distances.splice(index_of_min, 1);
			console.log("Distances: " + distances);
			new_origin = destinations_copy[index_of_min];
			destinations_copy.splice(index_of_min, 1);
			console.log("Destinations Copy: " + destinations_copy);

			draw_directions(origin, new_origin);
			console.log(added_home_to_path);
			if (distances.length > 0) {
				distance_and_time(new_origin, destinations_copy, path, tot_distance);
			}
			else if (added_home_to_path == false) {
				added_home_to_path = true;
				destinations_copy.push(home);
				distance_and_time(new_origin, destinations_copy, path, tot_distance);
			}
			draw_directions(new_origin, home);
			$("#path").html("<strong>Your ideal path is:</strong><br>" + path.join(' &rarr; '));
			$("#total_distance").html("The total distance needed to cover this path is <strong>" + tot_distance + "</strong> miles.");
		}
		else {
			alert('Error was: ' + status);
		}
	})
}