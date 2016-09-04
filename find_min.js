function find_min(array) {
	var min = array[0], index = 0;
	for (var i = 0; i < array.length; i++) {
		if (array[i] < min) {
			min = array[i];
			index = i;
		}
	}
	return [min, index];
}