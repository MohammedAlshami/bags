import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Landing from "@/models/Landing";
import Collection from "@/models/Collection";
import User from "@/models/User";
import Order from "@/models/Order";
import { SEED_PRODUCTS, SEED_COLLECTIONS, SEED_LANDING } from "@/lib/seed-data";
import { parsePrice } from "@/lib/cart";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

const SEED_CUSTOMER_USERNAME = "customer";
const SEED_CUSTOMER_PASSWORD = "customer";

export async function POST() {
  try {
    await dbConnect();

    await Product.deleteMany({});
    await Landing.deleteMany({});
    await Collection.deleteMany({});

    const collections = await Collection.insertMany(SEED_COLLECTIONS);
    const collectionBySlug = new Map<string, string>();
    collections.forEach((c: { slug: string; _id: unknown }) => {
      collectionBySlug.set(c.slug, String(c._id));
    });

    const productsWithCollection = SEED_PRODUCTS.map((p: { collectionSlug: string; name: string; price: string; category: string; image: string; slug: string }) => {
      const collectionId = collectionBySlug.get(p.collectionSlug) ?? collectionBySlug.get("essentials");
      const { collectionSlug: _s, ...rest } = p;
      return { ...rest, collection: collectionId };
    });
    const products = await Product.insertMany(productsWithCollection);
    const landing = await Landing.create(SEED_LANDING);

    let adminCreated = 0;
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
      await User.create({ username: "admin", password: await hash("admin", 10), role: "admin" });
      adminCreated = 1;
    }

    let customerCreated = 0;
    let seedCustomer = await User.findOne({ username: SEED_CUSTOMER_USERNAME, role: "customer" });
    if (!seedCustomer) {
      seedCustomer = await User.create({
        username: SEED_CUSTOMER_USERNAME,
        password: await hash(SEED_CUSTOMER_PASSWORD, 10),
        role: "customer",
        email: "customer@example.com",
        fullName: "Seed Customer",
        address: "123 Main Street\nCape Town 8001\nSouth Africa",
        phone: "+27 21 123 4567",
      });
      customerCreated = 1;
    }

    const firstProduct = products[0];
    const priceNum = parsePrice(firstProduct.price);
    const shippingAddress = {
      fullName: "Seed Customer",
      line1: "123 Main Street",
      line2: "",
      city: "Cape Town",
      state: "Western Cape",
      postCode: "8001",
      country: "South Africa",
    };
    const openOrderExists = await Order.findOne({ status: "pending", customer: seedCustomer._id });
    let orderCreated = 0;
    if (!openOrderExists) {
      await Order.create({
        customer: seedCustomer._id,
        items: [
          { slug: firstProduct.slug, name: firstProduct.name, price: firstProduct.price, quantity: 1 },
        ],
        total: priceNum * 1,
        status: "pending",
        shippingAddress,
      });
      orderCreated = 1;
    }

    const shippedOrderExists = await Order.findOne({
      status: "shipped",
      customer: seedCustomer._id,
    });
    if (!shippedOrderExists) {
      const secondProduct = products[1];
      const secondPriceNum = parsePrice(secondProduct?.price ?? "$0");
      await Order.create({
        customer: seedCustomer._id,
        items: [
          {
            slug: secondProduct?.slug ?? "leather-crossbody",
            name: secondProduct?.name ?? "Leather Crossbody",
            price: secondProduct?.price ?? "$980",
            quantity: 1,
          },
        ],
        total: secondPriceNum,
        status: "shipped",
        shippingAddress,
        trackingNumber: "CBW123456789ZA",
        carrier: "DHL",
        shippedAt: new Date(),
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Seeded carol_Bouwer database",
      collectionsInserted: collections.length,
      productsInserted: products.length,
      landingInserted: landing ? 1 : 0,
      adminCreated,
      customerCreated,
      orderCreated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seed failed";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
