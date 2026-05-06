import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const numSeq = request.nextUrl.searchParams.get('numSeq') as string;
	const num = String(Math.round(Number(numSeq)));
	const apiRes = await fetch(`http://simulator:5000/get_sequencing?numSeq=${num}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});


	const data = await apiRes.json();

	return NextResponse.json(data);

}
