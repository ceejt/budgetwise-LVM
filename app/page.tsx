import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ backgroundColor: "#F5F5F5" }}
    >
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold mb-4" style={{ color: "#293F55" }}>
          BUDGETWISE
        </h1>
        <p className="text-xl mb-2" style={{ color: "#293F55" }}>
          Track Smart. Spend Wise
        </p>
        <p className="text-muted-foreground mb-8">
          Your all-in-one student-oriented budget tracker. Manage expenses, set
          goals, and get personalized financial tips.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button
              size="lg"
              style={{ backgroundColor: "#72ADFD", color: "white" }}
            >
              Get Started
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button
              size="lg"
              variant="outline"
              style={{ borderColor: "#293F55", color: "#293F55" }}
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
