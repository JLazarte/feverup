import { MongoClient } from 'mongodb';

async function setupDatabase() {
	const client = new MongoClient(process.env.MONGO_URI);

	try {
		console.log('Setup database: RUNNING');

		await client.connect();
		const db = client.db('challenge-db');

		const collections = await db.listCollections().toArray();
		const hasEventsCollectionInitialized = collections.find((col) => col.name === 'events');

		if (!hasEventsCollectionInitialized) {
			await db.createCollection('events');
			await db.collection('events').createIndex({ start_date: 1, end_date: 1 });
			console.log('Created collection: events');
		}

		const { users } = await db.command({ usersInfo: 1 });
		const writerUser = users.find((item) => item.user === 'writer');
		const readerUser = users.find((item) => item.user === 'reader');

		if (writerUser === undefined) {
			// Create writer user
			await db.command({
				createUser: 'writer',
				pwd: 'writer',
				roles: [{ role: 'readWrite', db: 'challenge-db' }],
			});
			console.log('Created user: writer');
		}

		if (readerUser === undefined) {
			// Create reader user
			await db.command({
				createUser: 'reader',
				pwd: 'reader',
				roles: [{ role: 'read', db: 'challenge-db' }],
			});
			console.log('Created user: reader');
		}

		console.log('Setup database: FINISH');
	} catch (error) {
		console.error(error.message, error);
	} finally {
		await client.close();
	}
}

setupDatabase();
