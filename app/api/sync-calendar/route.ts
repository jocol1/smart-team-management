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

    // --- ĐOẠN SỬA QUAN TRỌNG NHẤT ---
    let keyData;
    try {
      const cleanKey = envKey.trim().replace(/^'|'$/g, '');
      
      // Kiểm tra nếu là JSON (bắt đầu bằng dấu {) thì parse luôn
      // Nếu không thì giải mã Base64 rồi mới parse
      if (cleanKey.startsWith('{')) {
        keyData = JSON.parse(cleanKey);
      } else {
        const decodedKey = Buffer.from(cleanKey, 'base64').toString('utf-8');
        keyData = JSON.parse(decodedKey);
      }
    } catch (e) {
      console.error("❌ LỖI GIẢI MÃ KEY:", e);
      return NextResponse.json({ error: "Định dạng Key không hợp lệ" }, { status: 500 });
    }
    // -------------------------------

    const auth = new google.auth.GoogleAuth({
      credentials: keyData,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    const formattedDate = new Date(deadline).toISOString().split("T")[0];

    const response = await calendar.events.insert({
      calendarId: "lytanloc10c1@gmail.com",
      requestBody: {
        summary: `🚩 DEADLINE: ${name}`,
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
    // Log chi tiết để bạn xem trong Netlify Function Logs
    console.error("❌ LỖI GOOGLE API CHI TIẾT:", JSON.stringify(error.response?.data) || error.message);
    return NextResponse.json({ error: "Lỗi Server Google API" }, { status: 500 });
  }
}
