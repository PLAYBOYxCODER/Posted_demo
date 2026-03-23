import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'global_config_db.json');

// Initialize if empty
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}), 'utf-8');
}

export async function GET() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({}, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    fs.writeFileSync(DB_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write config' }, { status: 500 });
  }
}
