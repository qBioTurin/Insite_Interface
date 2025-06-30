import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	const body = await req.json();

	const apiRes=await fetch(`http://simulator:5000/get_obs_tum?depth=${body.depth}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});


	const data = await apiRes.json();

	return NextResponse.json(data);

}
