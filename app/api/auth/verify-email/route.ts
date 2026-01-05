import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/email/verification-error?error=no-token", request.url));
    }

    // Buscar o token no banco
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/email/verification-error?error=invalid-token", request.url));
    }

    // Verificar se o token expirou
    if (verificationToken.expires < new Date()) {
      // Deletar o token expirado
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(new URL("/email/verification-error?error=expired-token", request.url));
    }

    // Atualizar o usuário para ativo
    await prisma.user.update({
      where: { id: verificationToken.identifier },
      data: { status: "ACTIVE" },
    });

    // Deletar o token usado
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Redirecionar para a página de sucesso
    return NextResponse.redirect(new URL("/email/email-verified/page", request.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL("/email/verification-error?error=server-error", request.url));
  }
}