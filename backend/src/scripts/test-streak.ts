import { StreakService } from "../services/streak.service";
import { getUserPrisma } from "../config/dynamicPrisma";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    console.log("Testing getDashboardData...");
    // Let's use a dummy user ID to test the creation and lookup flow
    const userId = "cli-test-user-999";
    const prisma = await getUserPrisma(userId);
    
    const data = await StreakService.getDashboardData(userId, "Asia/Kolkata", prisma);
    console.log("Dashboard Data query completed successfully:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error("TEST FAILED WITH EXCEPTION:");
    console.error(error);
  }
}

run();
