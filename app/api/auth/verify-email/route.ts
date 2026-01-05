import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserStatus } from "@prisma/client";
import { sendEmail } from "@/services/send-email";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Token is missing" }, { status: 400 });
  }

  try {
    // Use a transaction para garantir atomicidade
    const user = await prisma.$transaction(async (tx) => {
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
      });

      if (!existingUser) {
        throw new Error("USER_NOT_FOUND");
      }

      if (
        existingUser?.status === UserStatus.ACTIVE &&
        existingUser.emailVerifiedAt
      ) {
        throw new Error("ALREADY_VERIFIED");
      }

      // Atualize o usuário
      const updatedUser = await tx.user.update({
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

      return updatedUser;
    });

    // Enviar email de boas-vindas FORA da transação
    // Isso evita que erros no envio de email revertam a transação
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Duolingo!",
        template: "welcome",
        content: {
          userName: user.name || "",
          buttonUrl: `${process.env.NEXTAUTH_URL}/learn`,
          streakDays: 7,
        },
      });
    } catch (emailError) {
      // Log o erro, mas não falhe a verificação por causa disso
      console.error("Failed to send welcome email:", emailError);
      // A verificação ainda foi bem sucedida, então não retorne erro
    }

    return NextResponse.json(
      {
        message: "Email verified successfully! Welcome email sent.",
        redirectUrl: "/learn", // Opcional: redirecionar o frontend
      },
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
            { status: 200 }
          );
        case "USER_NOT_FOUND":
          return NextResponse.json(
            { message: "User not found" },
            { status: 404 }
          );
      }
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
