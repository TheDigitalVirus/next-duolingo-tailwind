import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Token is missing" }, { status: 400 });
  }

  try {
    // Use a transaction para garantir atomicidade
    const result = await prisma.$transaction(async (tx) => {
      // Primeiro, tente encontrar E deletar o token em uma única operação
      const verificationToken = await tx.verificationToken.findUnique({
        where: { token },
      });

      if (!verificationToken) {
        throw new Error("TOKEN_NOT_FOUND");
      }

      if (verificationToken.expires < new Date()) {
        throw new Error("TOKEN_EXPIRED");
      }

      // Verifique se o usuário já está ativo (idempotência)
      const existingUser = await tx.user.findUnique({
        where: { id: verificationToken.identifier },
        select: { status: true, emailVerifiedAt: true },
      });

      if (
        existingUser?.status === UserStatus.ACTIVE &&
        existingUser.emailVerifiedAt
      ) {
        throw new Error("ALREADY_VERIFIED");
      }

      // Atualize o usuário
      await tx.user.update({
        where: { id: verificationToken.identifier },
        data: {
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
          lastActiveAt: new Date(),
        },
      });

      // Delete o token
      await tx.verificationToken.delete({
        where: { token },
      });

      return { success: true };
    });

    return NextResponse.json(
      { message: "Email verified successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);

    // Trate diferentes tipos de erro de forma específica
    if (error instanceof Error) {
      switch (error.message) {
        case "TOKEN_NOT_FOUND":
          return NextResponse.json(
            { message: "Invalid or already used token" },
            { status: 400 }
          );
        case "TOKEN_EXPIRED":
          return NextResponse.json(
            { message: "Token has expired" },
            { status: 400 }
          );
        case "ALREADY_VERIFIED":
          return NextResponse.json(
            { message: "Email already verified" },
            { status: 200 } // 200 porque tecnicamente é sucesso
          );
      }
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
