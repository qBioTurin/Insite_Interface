import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const frequence = request.nextUrl.searchParams.get('frequence') as string;
	const flaskUrl = `http://simulator:5000/download_pdf?frequence=${frequence}`; 

	try {
		const flaskRes = await fetch(flaskUrl);

		if (!flaskRes.ok) {
			return NextResponse.json({ error: 'Errore dal server Flask' }, { status: 500 });
		}

		const blob = await flaskRes.blob();
		const buffer = await blob.arrayBuffer();

		return new NextResponse(Buffer.from(buffer), {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'attachment; filename="file.pdf"',
			},
		});
	} catch (error) {
		return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
	}
}
