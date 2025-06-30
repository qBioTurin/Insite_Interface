import { NextResponse } from 'next/server';

export async function GET(req: Request) {
	const apiRes = await fetch('http://simulator:5000/check_percentage', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});


	const data = await apiRes.json();

	return NextResponse.json(data);

}
