import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          FlowDesk
        </h1>
        <p className="max-w-xl text-lg text-slate-600">
          Freelancer workforce operations, simplified. Manage your team across platforms without the tab fatigue.
        </p>
        <div className="flex gap-4 mt-4">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
