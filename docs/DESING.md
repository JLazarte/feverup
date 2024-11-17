# Fever code challenge desing

## Search Criteria

When finding an event between two points in time, we use a **collision detection approach**.

This means that as long as the event **has started but not ended** within the **searched period** of time, it will be retrieved.

For example:

The event **'Show'** starts on Tuesday and ends on Friday.

The **'Show'** event will be retrieved in the following searches:

* Events on **Wednesday**.
* From **Monday** to **Wednesday**.
* From **Wednesday** to **Saturday**.
* From **Monday** to **Saturday**.


#### Inspired by
https://www.youtube.com/watch?v=eED4bSkYCB8&t=166s



## Events groups by timespan/weeks

It is more usefull to storage all the events in groups of timespan

The timespan selected for now is a week. As a next step we should be able to define a custom timespan at docker-compose config

### How it works?

if we had a group of events:

	[ A, D, E, B ]

We will storage them at mongo sorted by starts_at and ends_at values

	# Mongo
	[ A, B, D, E]

At the same time we will storage at redis the same events but agrouping them by the timespan that they belong

	# Redis
	{
		1: [ A, B ] // Week 1
		2: [ D, E ] // Week 2
	}

So if a new element appears `C`, it needs to recreate the Redis cache map, but only at the weeks that have been affected

In this case C is a event that has a duration of 10 days, so it will afect more than one week

New state:

	# Mongo
	[ a, b, C, d, e]

Cache new state:

	# Redis
	{
		1: [ a, b, C ] // Week 1
		2: [ C, d, e ] // Week 2
	}

### How do we know the weeks affected by an event?

We will take the Unix Epoch as reference, from that we will calculate how many weeks pass until **starts_at** and **ends_at** of the event

For example for the event:

	{
		starts_at":"2021-07-31T21:00:00.000Z",
		ends_at":"2021-08-12T22:00:00.000Z"
	}

Means that starts at the week 2691 and ends at 2693, that means that that event belongs to three groups at redis cache [ 2691, 2692, 2693 ]

	NOTE: This approach assumes that the events don't take so long, to avoid a large amount of duplicate values

## Events Gathering

The logic of gathering is quite simple. It will:

* Retrieve and parse events from the external service.
* Save those events in MongoDB.
* Identify which weeks were affected by the last saved events.
* Refresh the values of those weeks in the Redis cache.

## Events Supplier

The logic of supplying is more complex. It will:

* Identify the target weeks from the query.
* Identify the gaps of information in the local LRUCache.
* Search Redis for those gaps and save the results in the LRUCache.
* Using the values from the LRUCache, retrieve all the target weeks.
* Join those weeks, avoiding duplicate events (see `Events groups by timespan/weeks`).
* Filter the events based on the original query.
* Formated those events to the expected dto