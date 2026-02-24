import { google } from "googleapis";
import { NextResponse } from "next/server";

interface GoogleApiError {
  response?: { data?: unknown };
  message?: string;
}

export async function POST(req: Request) {
  try {
    const { name, deadline, manager_email } = await req.json();

    const envKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!envKey) return NextResponse.json({ error: "Thiếu Key .env" }, { status: 500 });

    const cleanKey = envKey.trim().replace(/^'|'$/g, '');
    const keyData = JSON.parse(cleanKey);

    const auth = new google.auth.GoogleAuth({
      credentials: keyData,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Định dạng ngày cho sự kiện (Dạng YYYY-MM-DD)
    const formattedDate = new Date(deadline).toISOString().split("T")[0];

    const response = await calendar.events.insert({
      calendarId: "lytanloc10c1@gmail.com",
      requestBody: {
        summary: `🚩 DEADLINE: ${name}`, // Tiêu đề hiện trên lịch
        description: `Dự án giao cho: ${manager_email}. Vui lòng hoàn thành đúng hạn.`,
        start: { date: formattedDate },
        end: { date: formattedDate },
      },
      sendUpdates: "none",
    });

    console.log("✅ Đã đặt lịch deadline thành công:", name);
    return NextResponse.json({ success: true, id: response.data.id });

  } catch (err: unknown) {
    const error = err as GoogleApiError;
    console.error("❌ LỖI GOOGLE API:", error.response?.data || error.message);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}