import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/services/send-email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = bcrypt.hashSync(user.id + Date.now(), 10);
    const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.verificationToken.create({
      data: {
        identifier: user.id,
        token: resetToken,
        expires: tokenExpires,
      },
    });

    // Construct reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      content: {
        title: `Hello, ${user.name || "there"}`,
        subtitle:
          "You requested to reset your password. Click the button below to create a new password.",
        buttonLabel: "Reset Password",
        buttonUrl: resetUrl,
        description:
          "This link will expire in 1 hour. If you didn't request this, please ignore this email.",
      },
    });

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
