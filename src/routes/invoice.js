import got from 'got';

const username = 'bob',
	network = 'lightning';

export async function GET({ params }) {
	let text = await got
		.post('http://localhost:3119/lightning/invoice', {
			json: { amount: 100 }
		})
		.text();

	await got
		.post('http://localhost:3119/invoice', {
			json: { invoice: { text, network }, user: { username } }
		})
		.json();

	return { body: { text } };
}
