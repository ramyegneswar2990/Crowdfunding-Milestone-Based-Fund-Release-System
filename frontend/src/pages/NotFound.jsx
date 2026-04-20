import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="card-elevated mx-auto max-w-xl p-10 text-center">
      <h1 className="text-5xl font-extrabold">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found.</p>
      <Button className="mt-4" asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
