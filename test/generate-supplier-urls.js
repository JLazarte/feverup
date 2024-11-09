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
const startQty = 600; 
const endQty = 10;

const urls = (new Array(startQty)).fill(0).flatMap((_, idx) => {
	const startDate = createDate(initialDate, idx);

	return (new Array(endQty).fill(0).map(() => {
		const randomDays = Math.floor(Math.random() * 200) + 1;
		const endDate = createDate(startDate, randomDays);

		const query = `start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`;
		
		return `GET ${baseUrl}?${query}`;
	}));
})

fs.writeFileSync(outputFile, urls.join('\n'), 'utf-8');

console.log(`Generated ${startQty * endQty} URLs in ${outputFile}`);