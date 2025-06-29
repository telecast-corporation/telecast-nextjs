import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendAccountDeletionEmail } from '@/lib/email';

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user details before deletion
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // At this point, we know user.email is not null
    const userEmail = user.email;

    // Delete user and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete verification tokens
      await tx.verificationToken.deleteMany({
        where: { identifier: userEmail },
      });

      // Delete password reset tokens
      await tx.passwordResetToken.deleteMany({
        where: { email: userEmail },
      });

      // Delete the user
      await tx.user.delete({
        where: { email: userEmail },
      });
    });

    // Send deletion confirmation email
    try {
      await sendAccountDeletionEmail(userEmail, user.name || 'User');
    } catch (emailError) {
      console.error('Failed to send account deletion email:', emailError);
      // Continue with deletion even if email fails
    }

    return NextResponse.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 