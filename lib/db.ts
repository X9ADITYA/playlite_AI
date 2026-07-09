import mongoose from 'mongoose';

declare global {
  var mongooseConnection: {
    promise: Promise<typeof mongoose> | null;
    connection: typeof mongoose | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

const cached = globalThis.mongooseConnection ?? { promise: null, connection: null };
globalThis.mongooseConnection = cached;

function getMongoUri() {
  const rawUri = MONGODB_URI?.trim();

  if (!rawUri) {
    throw new Error('MONGODB_URI is required');
  }

  return rawUri.startsWith('MONGODB_URI=') ? rawUri.slice('MONGODB_URI='.length) : rawUri;
}

function isSrvUri(uri: string) {
  return uri.startsWith('mongodb+srv://');
}

function buildDirectMongoUri(srvUri: string) {
  let parsed: URL;
  try {
    parsed = new URL(srvUri);
  } catch {
    return null;
  }

  const [clusterName, ...domainParts] = parsed.hostname.split('.');

  if (domainParts.length === 0) {
    return null;
  }

  const domain = domainParts.join('.');
  const hosts = [0, 1, 2].map((index) => `${clusterName}-shard-00-0${index}.${domain}:27017`);
  
  let credentials = '';
  if (parsed.username) {
    credentials = parsed.username;
    if (parsed.password) {
      credentials += `:${parsed.password}`;
    }
    credentials += '@';
  }

  const hostsStr = hosts.join(',');
  const pathname = parsed.pathname || '/';
  const queryParams = new URLSearchParams(parsed.search);
  queryParams.set('tls', queryParams.get('tls') ?? 'true');
  queryParams.set('authSource', queryParams.get('authSource') ?? 'admin');
  queryParams.delete('directConnection');

  const query = queryParams.toString();
  return `mongodb://${credentials}${hostsStr}${pathname}${query ? `?${query}` : ''}`;
}

function isMongoDnsLookupError(error: unknown) {
  return error instanceof Error && /querySrv ECONNREFUSED|getaddrinfo ENOTFOUND|querySrv EAI_AGAIN|Server selection timed out/i.test(error.message);
}

async function connectWithFallback(mongoUri: string) {
  try {
    return await mongoose.connect(mongoUri, {
      bufferCommands: false
    });
  } catch (error) {
    const fallbackUri = isSrvUri(mongoUri) ? buildDirectMongoUri(mongoUri) : null;

    if (!fallbackUri || !isMongoDnsLookupError(error)) {
      throw error;
    }

    return mongoose.connect(fallbackUri, {
      bufferCommands: false
    });
  }
}

export async function connectDb() {
  if (cached.connection) {
    return cached.connection;
  }

  const mongoUri = getMongoUri();

  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  if (!cached.promise) {
    cached.promise = connectWithFallback(mongoUri);
  }

  cached.connection = await cached.promise;
  return cached.connection;
}