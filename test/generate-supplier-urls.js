const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:8002/events';
const outputFile = path.join(__dirname, 'supplier.urls');

function formatDate(date) {
	return date.toISOString().split('T')[0];
}

function createDate(initialDate, daysToAdd) {
	const oneDayInMilis = 24 * 60 * 60 * 1000;
	const dateInMilis = initialDate.getTime();
	return new Date(dateInMilis + (daysToAdd * oneDayInMilis));
	
	
}

const initialDate = new Date(2021, 1, 1); 
const numUrls = 600; 

const urls = (new Array(numUrls)).fill(0).map((_, idx) => {
	const randomDays = Math.floor(Math.random() * 200) + 1;

	const startDate = createDate(initialDate, idx);
	const endDate = createDate(startDate, randomDays);

	const query = `start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`;
	
	return `GET ${baseUrl}?${query}`;
})

fs.writeFileSync(outputFile, urls.join('\n'), 'utf-8');

console.log(`Generated ${numUrls} URLs in ${outputFile}`);