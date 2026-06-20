import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createContact, testConnection, getContacts } from '@/lib/db';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  organisation: z.string().optional().or(z.literal('')),
  country: z.string().min(1, 'Country is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function GET() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database connection failed',
        },
        { status: 500 }
      );
    }

    // Get recent contacts (for testing)
    const contacts = await getContacts(5);

    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful',
        contacts: contacts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log received data for debugging (remove in production if sensitive)
    console.log('Received contact form data:', {
      name: body.name ? 'provided' : 'missing',
      email: body.email ? 'provided' : 'missing',
      organisation: body.organisation || 'empty',
      country: body.country ? 'provided' : 'missing',
      messageLength: body.message?.length || 0,
    });

    const validatedData = contactSchema.parse(body);

    // Normalize optional fields
    const normalizedData = {
      ...validatedData,
      organisation: validatedData.organisation || undefined,
    };

    // Actually save to database
    const contactEntry = await createContact({
      name: normalizedData.name,
      email: normalizedData.email,
      organisation: normalizedData.organisation,
      country: normalizedData.country,
      message: normalizedData.message,
    });

    // console.log('Contact entry saved to database:', contactEntry);

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
        data: contactEntry,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      // Format errors for better client display
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed. Please check your input and try again.',
          errors: formattedErrors,
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
