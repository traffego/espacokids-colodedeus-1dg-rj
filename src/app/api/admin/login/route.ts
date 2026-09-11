import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "colodedeus2026";
const COOKIE_NAME = "espacokids_admin_session";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || password.trim() !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Senha de acesso incorreta" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
