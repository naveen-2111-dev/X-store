import ConnectDb from "@/lib/db/connect";

export async function POST(req) {
  try {
    const db = await ConnectDb();
    const { walletId, slug } = await req.json();

    if (!walletId || !slug) {
      return Response.json(
        { error: "walletId and slug are required" },
        { status: 400 }
      );
    }

    const wallet = await db.findOneAndUpdate(
      { walletId },
      { $addToSet: { slugs: slug } },
      { upsert: true, new: true }
    );

    return Response.json(wallet, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
