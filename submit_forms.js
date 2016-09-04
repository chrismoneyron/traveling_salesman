var home, num_destinations, destinations_array = [];


function submit_home_form() {
	$("#path").html(null);
	$("#total_distance").html(null);

	destinations_array = [];

	for (var i = markers.length - 1; i >= 0; i--) {
		markers[i].setMap(null);
		markers.pop();
	}

	$("#destinations_form").html(null);
	home = $("#home").val();

	if (home == '') {
		alert("Please enter a valid home address");
		return;
	}

	num_destinations = Number($("#num_destinations").val());

	if (isNaN(num_destinations) || num_destinations <= 0 || num_destinations == '') {
		alert("Please enter a valid number for number of destinations");
		return;
	}

	code_address(home);

	for (var i = 0; i < num_destinations; i++) {
		$("#destinations_form").append("Destination " + (i + 1) + ":<br><br><input id = 'destination_" + (i + 1) + "'><br><br>");
	}

	$("#destinations_form").append("<button type = 'button' onclick = 'submit_destinations_form()'>Submit</button><br><br>");
	$("body").scrollTop($("body").scrollTop() + 825);
	$("#destination_1").focus();
}


function submit_destinations_form() {
	$("#path").html(null);
	$("#total_distance").html(null);

	for (var i = markers.length - 1; i >= 1; i--) {
		markers[i].setMap(null);
		markers.pop();
	}

	var index = 0;
	$("input").each(function() {
		if ($(this).attr('id').match('destination_')) {
			destinations_array[index] = $(this).val();

			if (destinations_array[index] == '') {
				alert('Please fill in all destination fields');
				return false;
			}

			code_address($(this).val());
			index++;
		}
	});
	$("body").scrollTop(53);

	var destinations_copy = destinations_array.slice();
	var path = [home], total_distance = 0;
	distance_and_time(home, destinations_copy, path, total_distance);
}