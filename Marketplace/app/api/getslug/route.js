import ConnectDb from "@/lib/db/connect";

export async function POST(req) {
  try {
    const db = await ConnectDb();
    const { walletId } = await req.json();

    if (!walletId) {
      return Response.json({ error: "walletId is required" }, { status: 400 });
    }

    const user = await db.findOne({ walletId });

    if (!user) {
      return Response.json(
        {
          message: "No user found",
          data: { Slug: [] },
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        message: "Success",
        data: {
          Slug: user.slugs || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
