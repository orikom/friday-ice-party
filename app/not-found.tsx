import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - עמוד לא נמצא</h1>
      <p className="text-gray-600 mb-8">
        העמוד שאתה מחפש לא קיים.
      </p>
      <Link href="/">
        <Button>חזור לדף הבית</Button>
      </Link>
    </div>
  );
}
