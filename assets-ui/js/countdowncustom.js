// Set the date we're counting down to
(function () {
	const second = 1000,
		minute = second * 60,
		hour = minute * 60,
		day = hour * 24;
	let today = new Date(),
		dd = String(today.getDate()).padStart(2, "0"),
		mm = String(today.getMonth() + 1).padStart(2, "0"),
		yyyy = today.getFullYear(),
		nextYear = yyyy + 1,
		dayMonth = "10/20/",
		birthday = dayMonth + yyyy;

	today = mm + "/" + dd + "/" + yyyy;
	if (today > birthday) {
		birthday = dayMonth + nextYear;
	}
	//end

	const countDown = new Date(birthday).getTime(),
		x = setInterval(function () {
			const now = new Date().getTime(),
				distance = countDown - now;

			const dayEl = document.getElementById("day");
			const hoursEl = document.getElementById("Hours");
			const minutesEl = document.getElementById("Minutes");
			const secondsEl = document.getElementById("Seconds");

			if (dayEl) dayEl.innerText = Math.floor(distance / day);
			if (hoursEl) hoursEl.innerText = Math.floor((distance % day) / hour);
			if (minutesEl) minutesEl.innerText = Math.floor((distance % hour) / minute);
			if (secondsEl) secondsEl.innerText = Math.floor((distance % minute) / second);

			//do something later when date is reached
			if (distance < 0) {
				var headline = document.getElementById("headline");
				var countdown = document.getElementById("countdown");
				var content = document.getElementById("content");
				if (headline) headline.innerText = "It's my birthday!";
				if (countdown) countdown.style.display = "none";
				if (content) content.style.display = "block";
				clearInterval(x);
			}
			//seconds
		}, 1000);
})();
