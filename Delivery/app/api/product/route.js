import ConnectDb from "@/lib/connect";

export async function POST(request) {
  try {
    const db = await ConnectDb();
    const { walletid, data1, data2 } = await request.json();

    const existingWallet = await db.wallet.findOne({
      walletId: walletid,
    });

    if (existingWallet) {
      return Response.json(
        {
          message: "Wallet already exists",
          existingData: existingWallet,
        },
        { status: 400 }
      );
    }

    const result = await db.wallet.insertOne({
      walletId: walletid,
      data1: data1,
      data2: data2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json(
      {
        message: "Wallet data stored successfully",
        insertedId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
