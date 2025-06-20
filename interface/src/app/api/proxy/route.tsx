import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	const body = await req.json();


	const apiRes = await fetch('http://simulator:5000/run-r', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});


	const data = await apiRes.json();

	return NextResponse.json(data);

}
