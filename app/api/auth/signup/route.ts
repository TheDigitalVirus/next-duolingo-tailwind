// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSignupSchema, SignupSchemaType } from "@/app/forms/signup-schema";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendEmail } from "@/services/send-email";
import { User, UserStatus } from "@prisma/client";

// Helper function to generate a verification token and send the email.
async function sendVerificationEmail(user: User) {
  // Create a new verification token.
  const token = await prisma.verificationToken.create({
    data: {
      identifier: user.id,
      token: bcrypt.hashSync(user.id, 10),
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
    },
  });

  // Construct the verification URL.
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token.token}`;

  // Send the verification email com template Duolingo
  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    template: 'verification',
    content: {
      buttonUrl: verificationUrl,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Verificar reCAPTCHA
    const recaptchaToken = request.headers.get("x-recaptcha-token");
    if (!recaptchaToken) {
      return NextResponse.json(
        { message: "reCAPTCHA token is required" },
        { status: 400 }
      );
    }
    // console.log(recaptchaToken)
    const isRecaptchaValid = await verifyRecaptchaToken(recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { message: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }
    // console.log(isRecaptchaValid)
    // Validar dados
    const schema = getSignupSchema();
    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: validationResult.error.errors },
        { status: 400 }
      );
    }
    // console.log(validationResult)
    const { email, password, name }: SignupSchemaType = validationResult.data;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    // console.log(existingUser)
    if (existingUser) {
      if (existingUser.status === UserStatus.INACTIVE) {
        // Resend verification email for inactive user.
        await prisma.verificationToken.deleteMany({
          where: { identifier: existingUser.id },
        });
        await sendVerificationEmail(existingUser);
        return NextResponse.json(
          { message: "Verification email resent. Please check your email." },
          { status: 200 }
        );
      } else {
        // User exists and is active.
        return NextResponse.json(
          { message: "Email is already registered." },
          { status: 409 }
        );
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Garantir que a role STUDENT existe
    let defaultRole = await prisma.userRole.findFirst({
      where: { name: "STUDENT" },
    });
    // console.log(defaultRole)
    if (!defaultRole) {
      throw new Error("Default role not found. Unable to create a new user.");
    }
    
    // Create a new user with INACTIVE status.
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        status: UserStatus.INACTIVE,
        roleId: defaultRole.id,
      },
      include: { role: true },
    });

    // console.log(user)

    // Send the verification email.
    await sendVerificationEmail(user);

    return NextResponse.json(
      {
        message:
          "Registration successful. Check your email to verify your account.",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Registration failed. Please try again later." },
      { status: 500 }
    );
  }
}
