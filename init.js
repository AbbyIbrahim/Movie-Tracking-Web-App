require("./lib/db");
const _ = require("lodash");
const fs = require("fs");
const Movie = require("./lib/mongoose/movie");
const Person = require("./lib/mongoose/person");

// require movies in 'data' variable like:
// const data = require("./movie-data-10.json");

async function createPerson(name) {
	try {
		const person = await new Person({
			name,
		});
		await person.save();
		return person;
	} catch {
		console.log("could not make this person: " + name);
	}
}

async function findPersonByName(name) {
	try {
		const person = await Person.findOne({
			name,
		});
		if (person) {
			return person;
		}
	} catch {}
}

async function getPersonId(name) {
	const existingPerson = await findPersonByName(name);
	if (existingPerson) return existingPerson._id;

	const newPerson = await createPerson(name);
	if (newPerson) return newPerson._id;

	console.log("could not find/create ==" + name + "== person.");
}

async function go() {
	const genre = [];

	console.log("creating movies ...");
	for await (let dMovie of data) {
		try {
			const directors = [];
			const writers = [];
			const actors = [];
			for await (let d of dMovie.Director) {
				const id = await getPersonId(d);
				if (id) {
					directors.push(id);
				}
			}
			for await (let w of dMovie.Writer) {
				const id = await getPersonId(w);
				if (id) {
					writers.push(id);
				}
			}
			for await (let a of dMovie.Actors) {
				const id = await getPersonId(a);
				if (id) {
					actors.push(id);
				}
			}

			genre.push(...dMovie.Genre);

			const movie = new Movie({
				title: dMovie.Title,
				year: dMovie.Year,
				released: dMovie.Released,
				runtime: dMovie.Runtime,
				genre: dMovie.Genre,
				directors: directors,
				writers: writers,
				actors: actors,
				plot: dMovie.Plot,
				poster: dMovie.Poster,
			});
			await movie.save();
			console.log("===== " + movie.title);
		} catch (e) {
			console.log("could not make the movie: " + dMovie.Title);
			console.log(e.message);
		}
	}
	console.log("done");

	console.log("writing genre.json file ...");
	fs.writeFileSync("./genre.json", JSON.stringify(_.uniq(genre)));
	console.log("done");
}

async function clean() {
	console.log("cleaning ...");
	try {
		await Person.collection.drop();
		await Movie.collection.drop();
	} catch {}
	console.log("done");
}

(async () => {
	await clean();
	await go();
})();
