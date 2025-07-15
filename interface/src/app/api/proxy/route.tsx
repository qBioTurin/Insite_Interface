import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	const body = await req.json();
	const seed = (req.nextUrl.searchParams.get('seed') ?? '') as string;

	await fetch(`http://simulator:5000/run-r?seed=${seed}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body.sim),
	});

	const apiRes = await fetch(`http://simulator:5000/get_obs_tum?depth=${body.depth}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});


	const data = await apiRes.json();

	return NextResponse.json(data);

}
