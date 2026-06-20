import { NextResponse } from "next/server";
import { validateGrievance } from "@/backend/services/grievanceValidator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, title, description, category, district } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image is required for validation." },
        { status: 400 }
      );
    }

    const result = await validateGrievance(image, title, description, category, district);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Validation Route error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during AI validation." },
      { status: 500 }
    );
  }
}
