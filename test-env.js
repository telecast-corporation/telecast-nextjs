console.log("Environment variables check:");
console.log("GOOGLE_CLOUD_PROJECT_ID:", process.env.GOOGLE_CLOUD_PROJECT_ID ? "SET" : "NOT SET");
console.log("GOOGLE_CLOUD_CLIENT_EMAIL:", process.env.GOOGLE_CLOUD_CLIENT_EMAIL ? "SET" : "NOT SET");
console.log("GOOGLE_CLOUD_PRIVATE_KEY:", process.env.GOOGLE_CLOUD_PRIVATE_KEY ? "SET" : "NOT SET");
console.log("GOOGLE_CLOUD_PODCAST_BUCKET_NAME:", process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME || "NOT SET"); 