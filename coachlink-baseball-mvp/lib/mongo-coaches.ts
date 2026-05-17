import { MongoClient, type Collection, type WithId } from "mongodb";
import { createInitialState } from "@/lib/mock-db";
import type { CoachProfile } from "@/lib/types";

type CoachDocument = CoachProfile & {
  applicationEmail?: string;
  updatedAt?: string;
};

declare global {
  var __coachMongoClientPromise: Promise<MongoClient> | undefined;
  var __coachMongoSeedPromise: Promise<void> | undefined;
}

const databaseName = process.env.MONGODB_DB ?? "pet-adoption";
const collectionName = process.env.MONGODB_COACHES_COLLECTION ?? "coaches";

export function isMongoCoachStoreConfigured() {
  return process.env.NODE_ENV !== "test" && Boolean(process.env.MONGODB_URI);
}

async function getClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  globalThis.__coachMongoClientPromise ??= new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  }).connect();

  return globalThis.__coachMongoClientPromise;
}

async function getCollection(): Promise<Collection<CoachDocument>> {
  const client = await getClient();
  const collection = client.db(databaseName).collection<CoachDocument>(collectionName);
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ applicationEmail: 1 }, { sparse: true });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ specialties: 1 });
  return collection;
}

function toCoachProfile(document: WithId<CoachDocument>): CoachProfile {
  const coach = { ...document } as CoachDocument & { _id?: unknown };
  delete coach._id;
  delete coach.applicationEmail;
  delete coach.updatedAt;
  return coach;
}

async function seedIfEmpty(collection: Collection<CoachDocument>) {
  const count = await collection.estimatedDocumentCount();

  if (count > 0) {
    return;
  }

  const seedCoaches = createInitialState().coachProfiles;
  await collection.bulkWrite(
    seedCoaches.map((coach) => ({
      updateOne: {
        filter: { id: coach.id },
        update: {
          $setOnInsert: {
            ...coach,
            updatedAt: coach.createdAt,
          },
        },
        upsert: true,
      },
    })),
  );
}

export async function getMongoCoachCollection() {
  if (!isMongoCoachStoreConfigured()) {
    return null;
  }

  const collection = await getCollection();
  globalThis.__coachMongoSeedPromise ??= seedIfEmpty(collection);
  await globalThis.__coachMongoSeedPromise;
  return collection;
}

export async function listMongoCoaches() {
  const collection = await getMongoCoachCollection();

  if (!collection) {
    return null;
  }

  const documents = await collection.find({}).sort({ rating: -1, name: 1 }).toArray();
  return documents.map(toCoachProfile);
}

export async function findMongoCoachById(coachId: string) {
  const collection = await getMongoCoachCollection();

  if (!collection) {
    return null;
  }

  const document = await collection.findOne({ id: coachId });
  return document ? toCoachProfile(document) : undefined;
}

export async function findMongoCoachByUserId(userId: string) {
  const collection = await getMongoCoachCollection();

  if (!collection) {
    return null;
  }

  const document = await collection.findOne({ userId });
  return document ? toCoachProfile(document) : undefined;
}

export async function findMongoCoachByApplicationEmail(email: string) {
  const collection = await getMongoCoachCollection();

  if (!collection) {
    return null;
  }

  const document = await collection.findOne({ applicationEmail: email });
  return document ? toCoachProfile(document) : undefined;
}

export async function insertMongoCoach(coach: CoachProfile, applicationEmail?: string) {
  const collection = await getMongoCoachCollection();

  if (!collection) {
    return null;
  }

  await collection.insertOne({
    ...coach,
    applicationEmail,
    updatedAt: coach.createdAt,
  });

  return coach;
}

export async function updateMongoCoach(coachId: string, update: Partial<CoachProfile>) {
  const collection = await getMongoCoachCollection();

  if (!collection) {
    return null;
  }

  const result = await collection.findOneAndUpdate(
    { id: coachId },
    {
      $set: {
        ...update,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: "after" },
  );

  return result ? toCoachProfile(result) : undefined;
}
