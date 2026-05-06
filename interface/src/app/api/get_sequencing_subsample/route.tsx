import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const numSeq = request.nextUrl.searchParams.get('numSeq') as string;
	const num = String(Math.round(Number(numSeq)));
	const first = request.nextUrl.searchParams.get('first') as string;
	const apiRes = await fetch(`http://simulator:5000/get_sequencing_subsample?numSeq=${num}&first=${first}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});


	const data = await apiRes.json();

	return NextResponse.json(data);

}
