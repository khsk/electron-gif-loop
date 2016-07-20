document.getElementById('register').addEventListener('click', function() {
	if (document.querySelector(':invalid')) {
		alert('invalid inputs')
		return
	}

	var settings = {
		tag        : document.getElementById('tag'       ).value.split(',').map(function(e){ return e.trim()}).filter(function(e) { return (e !== '')}) || 'random,',
		loop_count : document.getElementById('loop_count').value || '1',
	};

	localStorage.setItem('settings', JSON.stringify(settings));

	return
});

document.getElementById('back').addEventListener('click', function() {
	location.href = 'index.html'
});

(function() {
	if (!localStorage.getItem('settings')) {
		return;
	}
	var settings = JSON.parse(localStorage.getItem('settings'));
	document.getElementById('tag'       ).value = 'tag' in settings ? settings.tag.join(', ') : 'random';
	document.getElementById('loop_count').value = 'loop_count' in settings ? settings.loop_count : 1;

})()